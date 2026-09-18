import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class MailgunDriver implements EmailDriver {
  readonly id = "mailgun";
  readonly name = "Mailgun";
  readonly defaultDailyCap = 10000;

  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey) {
      throw new Error("MailgunDriver requires an apiKey.");
    }
    if (!credentials.domain) {
      throw new Error("MailgunDriver requires a sending domain.");
    }

    this.apiKey = credentials.apiKey;
    this.domain = credentials.domain;
    this.baseUrl =
      credentials.region === "eu"
        ? "https://api.eu.mailgun.net/v3"
        : "https://api.mailgun.net/v3";
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = `${this.baseUrl}/${this.domain}/messages`;

    const form = new FormData();
    const fromStr = message.from.name
      ? `"${message.from.name}" <${message.from.email}>`
      : message.from.email;

    form.append("from", fromStr);
    for (const t of message.to) {
      form.append("to", t.name ? `"${t.name}" <${t.email}>` : t.email);
    }
    form.append("subject", message.subject);
    if (message.text) form.append("text", message.text);
    if (message.html) form.append("html", message.html);
    if (message.replyTo) form.append("h:Reply-To", message.replyTo);

    if (message.headers) {
      for (const [key, val] of Object.entries(message.headers)) {
        form.append(`h:${key}`, val);
      }
    }

    if (message.tags) {
      for (const tag of Object.values(message.tags)) {
        form.append("o:tag", tag);
      }
    }

    if (message.attachments) {
      for (const att of message.attachments) {
        const buf =
          typeof att.content === "string"
            ? Buffer.from(att.content, "base64")
            : att.content;
        const blob = new Blob([buf], { type: att.contentType });
        form.append("attachment", blob, att.filename);
      }
    }

    const authHeader = `Basic ${Buffer.from(`api:${this.apiKey}`).toString("base64")}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader
      },
      body: form
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Mailgun API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { id?: string; message?: string };
    const messageId = data?.id?.replace(/[<>]/g, "") || `mg_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const authHeader = `Basic ${Buffer.from(`api:${this.apiKey}`).toString("base64")}`;
      const res = await fetch(`${this.baseUrl}/domains/${this.domain}`, {
        headers: { Authorization: authHeader }
      });
      return res.ok;
    } catch {
      return false;
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
