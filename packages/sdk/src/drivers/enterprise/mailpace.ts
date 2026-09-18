import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class MailPaceDriver implements EmailDriver {
  readonly id = "mailpace";
  readonly name = "MailPace";
  readonly defaultDailyCap = 5000;

  private serverToken: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.serverToken && !credentials.apiKey) {
      throw new Error("MailPaceDriver requires a serverToken or apiKey.");
    }
    this.serverToken = credentials.serverToken || credentials.apiKey!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://app.mailpace.com/api/v1/send";

    const fromFormatted = message.from.name
      ? `"${message.from.name}" <${message.from.email}>`
      : message.from.email;

    const payload = {
      from: fromFormatted,
      to: message.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)).join(", "),
      subject: message.subject,
      htmlbody: message.html,
      textbody: message.text,
      replyto: message.replyTo,
      attachments: message.attachments?.map((att) => ({
        name: att.filename,
        content_type: att.contentType,
        content:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64")
      }))
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Mailpace-Server-Token": this.serverToken,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`MailPace API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { id?: number | string; status?: string };
    const messageId = String(data?.id || `mp_${Date.now()}`);

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return Boolean(this.serverToken);
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}
