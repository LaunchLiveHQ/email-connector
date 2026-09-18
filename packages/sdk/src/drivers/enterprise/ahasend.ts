import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class AhaSendDriver implements EmailDriver {
  readonly id = "ahasend";
  readonly name = "AhaSend";
  readonly defaultDailyCap = 10000;

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("AhaSendDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.ahasend.com/v1/email/send";

    const payload = {
      from: {
        email: message.from.email,
        name: message.from.name
      },
      to: message.to.map((t) => ({ email: t.email, name: t.name })),
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo ? { email: message.replyTo } : undefined,
      headers: message.headers,
      attachments: message.attachments?.map((att) => ({
        filename: att.filename,
        content:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64"),
        content_type: att.contentType
      }))
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`AhaSend API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { id?: string; message_id?: string };
    const messageId = data?.message_id || data?.id || `aha_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}
