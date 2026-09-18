import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class MailtrapDriver implements EmailDriver {
  readonly id = "mailtrap";
  readonly name = "Mailtrap Email Sending";
  readonly defaultDailyCap = 10000;

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("MailtrapDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://send.api.mailtrap.io/api/send";

    const payload = {
      from: {
        email: message.from.email,
        name: message.from.name || undefined
      },
      to: message.to.map((t) => ({
        email: t.email,
        name: t.name || undefined
      })),
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers: message.headers,
      attachments: message.attachments?.map((att) => ({
        filename: att.filename,
        content:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64"),
        type: att.contentType,
        disposition: "attachment"
      }))
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Mailtrap API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { success?: boolean; message_ids?: string[] };
    const messageId = data?.message_ids?.[0] || `mt_${Date.now()}`;

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
      const res = await fetch("https://mailtrap.io/api/accounts", {
        headers: { Authorization: `Bearer ${this.apiKey}` }
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
