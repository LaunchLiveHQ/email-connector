import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";
import net from "node:net";
import tls from "node:tls";
import { randomUUID } from "node:crypto";

type Socket = net.Socket | tls.TLSSocket;

export interface SmtpDriverOptions {
  host: string;
  port: number;
  secure: boolean;
  requireTls?: boolean;
  user?: string;
  password?: string;
  heloName?: string;
  timeoutMs?: number;
}

export class SmtpDriver implements EmailDriver {
  readonly id = "smtp";
  readonly name = "Custom SMTP Relay / SendPulse / Mailpit";
  readonly defaultDailyCap = 999999; // Unlimited custom SMTP

  private options: SmtpDriverOptions;

  constructor(credentials: DriverCredentials) {
    const port = credentials.port || (credentials.encryption === "ssl" ? 465 : 587);
    const secure = credentials.encryption === "ssl" || port === 465;
    const requireTls = credentials.encryption === "tls" || credentials.encryption === "starttls" || port === 587;

    this.options = {
      host: credentials.host || "localhost",
      port,
      secure,
      requireTls,
      user: credentials.user,
      password: credentials.password,
      heloName: "localhost",
      timeoutMs: 15000
    };
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const client = new SmtpSocketClient(this.options);

    try {
      const response = await client.send(message);
      const latencyMs = Date.now() - startTime;

      return {
        status: "sent",
        messageId: response.messageId,
        provider: this.id,
        latencyMs: Math.max(latencyMs, 1),
        attempts: [{ provider: this.id, status: "success", statusCode: 250, durationMs: latencyMs }]
      };
    } finally {
      client.close();
    }
  }

  async verifyCredentials(): Promise<boolean> {
    const client = new SmtpSocketClient(this.options);
    try {
      return await client.verify();
    } catch {
      return false;
    } finally {
      client.close();
    }
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}

export class SmtpSocketClient {
  private socket?: Socket;
  private buffer = "";
  private readonly pending: Array<(line: string) => void> = [];

  constructor(private readonly options: SmtpDriverOptions) {}

  async send(message: UnifiedEmailPayload): Promise<{ messageId: string; response: string }> {
    await this.connect();
    await this.expect([220]);
    await this.command(`EHLO ${this.options.heloName ?? "localhost"}`, [250]);

    const shouldStartTls =
      !this.options.secure &&
      (this.options.requireTls || (Boolean(this.options.user) && this.options.port !== 1025));

    if (shouldStartTls) {
      await this.command("STARTTLS", [220]);
      await this.upgradeToTls();
      await this.command(`EHLO ${this.options.heloName ?? "localhost"}`, [250]);
    }

    if (this.options.user && this.options.password) {
      await this.authenticate();
    }

    const fromAddress = message.from.email;
    const recipients = message.to.map((r) => r.email);

    await this.command(`MAIL FROM:<${fromAddress}>`, [250]);

    for (const recipient of recipients) {
      await this.command(`RCPT TO:<${recipient}>`, [250, 251]);
    }

    await this.command("DATA", [354]);
    const mime = buildMimePayload(message);
    const response = await this.command(`${escapeSmtpData(mime)}\r\n.`, [250]);
    await this.command("QUIT", [221]).catch(() => undefined);

    const messageId = extractSmtpMessageId(response) || `smtp_${Date.now()}_${randomUUID().substring(0, 8)}`;

    return {
      messageId,
      response
    };
  }

  async verify(): Promise<boolean> {
    await this.connect();
    await this.expect([220]);
    await this.command(`EHLO ${this.options.heloName ?? "localhost"}`, [250]);

    if (!this.options.secure && this.options.requireTls) {
      await this.command("STARTTLS", [220]);
      await this.upgradeToTls();
      await this.command(`EHLO ${this.options.heloName ?? "localhost"}`, [250]);
    }

    if (this.options.user && this.options.password) {
      await this.authenticate();
    }

    await this.command("QUIT", [221]).catch(() => undefined);
    return true;
  }

  close() {
    this.socket?.destroy();
  }

  private connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => reject(error);
      const onTimeout = () => reject(new Error(`SMTP connection to ${this.options.host}:${this.options.port} timed out.`));

      const socket = this.options.secure
        ? tls.connect({
            host: this.options.host,
            port: this.options.port,
            servername: this.options.host,
            timeout: this.options.timeoutMs ?? 15000,
            rejectUnauthorized: false
          })
        : net.connect({
            host: this.options.host,
            port: this.options.port,
            timeout: this.options.timeoutMs ?? 15000
          });

      this.socket = socket;
      socket.setEncoding("utf8");
      socket.once("error", onError);
      socket.once("timeout", onTimeout);
      socket.once("connect", () => {
        socket.off("error", onError);
        socket.off("timeout", onTimeout);
        resolve();
      });
      socket.on("data", (chunk: string) => this.onData(chunk));
      socket.on("error", (error) => {
        const pending = this.pending.shift();
        pending?.(`599 ${error.message}`);
      });
    });
  }

  private upgradeToTls(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const current = this.socket;
      if (!current) {
        throw new Error("SMTP socket is not connected.");
      }

      current.removeAllListeners("data");
      const secure = tls.connect({
        socket: current,
        servername: this.options.host,
        timeout: this.options.timeoutMs ?? 15000,
        rejectUnauthorized: false
      });

      this.socket = secure;
      secure.setEncoding("utf8");
      secure.on("data", (chunk: string) => this.onData(chunk));
      secure.once("error", reject);
      secure.once("timeout", () => reject(new Error("SMTP TLS upgrade timed out.")));
      secure.once("secureConnect", () => resolve());
    });
  }

  private async authenticate() {
    const { user, password } = this.options;
    if (!user || !password) return;

    try {
      await this.command("AUTH LOGIN", [334]);
      await this.command(Buffer.from(user).toString("base64"), [334]);
      await this.command(Buffer.from(password).toString("base64"), [235]);
    } catch {
      const plainPayload = Buffer.from(`\0${user}\0${password}`).toString("base64");
      await this.command(`AUTH PLAIN ${plainPayload}`, [235]);
    }
  }

  private command(command: string, expected: number[]): Promise<string> {
    this.write(`${command}\r\n`);
    return this.expect(expected);
  }

  private expect(expected: number[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.pending.indexOf(onLine);
        if (index >= 0) this.pending.splice(index, 1);
        reject(new Error(`SMTP command timed out waiting for [${expected.join(", ")}].`));
      }, this.options.timeoutMs ?? 15000);

      const onLine = (line: string) => {
        clearTimeout(timeout);
        const code = Number(line.slice(0, 3));
        if (expected.includes(code)) {
          resolve(line);
          return;
        }
        reject(new Error(`SMTP expected [${expected.join(", ")}] but received: ${line}`));
      };

      this.pending.push(onLine);
    });
  }

  private write(value: string) {
    if (!this.socket) {
      throw new Error("SMTP socket is not connected.");
    }
    this.socket.write(value);
  }

  private onData(chunk: string) {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (/^\d{3}\s/.test(line)) {
        const pending = this.pending.shift();
        pending?.(line);
      }
    }
  }
}

function escapeSmtpData(data: string): string {
  return data.replace(/\r?\n\./g, "\r\n..");
}

function extractSmtpMessageId(response: string): string | undefined {
  const match = response.match(/(?:queued as|id)[=:\s]+<?([^>\s]+)>?/i);
  return match ? match[1] : undefined;
}

export function buildMimePayload(message: UnifiedEmailPayload): string {
  const boundaryMixed = `mixed_${randomUUID()}`;
  const boundaryAlt = `alt_${randomUUID()}`;

  const fromFormatted = message.from.name
    ? `"${message.from.name}" <${message.from.email}>`
    : message.from.email;

  const toFormatted = message.to
    .map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email))
    .join(", ");

  const headers: string[] = [
    `From: ${fromFormatted}`,
    `To: ${toFormatted}`,
    `Subject: =?UTF-8?B?${Buffer.from(message.subject).toString("base64")}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${randomUUID()}@emailconnector.local>`,
    `MIME-Version: 1.0`
  ];

  if (message.replyTo) {
    headers.push(`Reply-To: ${message.replyTo}`);
  }

  if (message.headers) {
    for (const [key, val] of Object.entries(message.headers)) {
      headers.push(`${key}: ${val}`);
    }
  }

  const hasAttachments = Boolean(message.attachments && message.attachments.length > 0);

  if (hasAttachments) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`);
    let body = headers.join("\r\n") + "\r\n\r\n";

    body += `--${boundaryMixed}\r\n`;
    body += `Content-Type: multipart/alternative; boundary="${boundaryAlt}"\r\n\r\n`;

    if (message.text) {
      body += `--${boundaryAlt}\r\n`;
      body += `Content-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n`;
      body += `${message.text}\r\n`;
    }

    if (message.html) {
      body += `--${boundaryAlt}\r\n`;
      body += `Content-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n`;
      body += `${message.html}\r\n`;
    }

    body += `--${boundaryAlt}--\r\n`;

    for (const att of message.attachments!) {
      const base64Content =
        typeof att.content === "string"
          ? att.content
          : Buffer.from(att.content).toString("base64");

      body += `--${boundaryMixed}\r\n`;
      body += `Content-Type: ${att.contentType}; name="${att.filename}"\r\n`;
      body += `Content-Disposition: attachment; filename="${att.filename}"\r\n`;
      body += `Content-Transfer-Encoding: base64\r\n\r\n`;
      body += `${base64Content.replace(/(.{76})/g, "$1\r\n")}\r\n`;
    }

    body += `--${boundaryMixed}--`;
    return body;
  }

  if (message.html && message.text) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`);
    let body = headers.join("\r\n") + "\r\n\r\n";
    body += `--${boundaryAlt}\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${message.text}\r\n`;
    body += `--${boundaryAlt}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${message.html}\r\n`;
    body += `--${boundaryAlt}--`;
    return body;
  }

  if (message.html) {
    headers.push(`Content-Type: text/html; charset=utf-8`);
    headers.push(`Content-Transfer-Encoding: 8bit`);
    return headers.join("\r\n") + "\r\n\r\n" + message.html;
  }

  headers.push(`Content-Type: text/plain; charset=utf-8`);
  headers.push(`Content-Transfer-Encoding: 8bit`);
  return headers.join("\r\n") + "\r\n\r\n" + (message.text || "");
}
