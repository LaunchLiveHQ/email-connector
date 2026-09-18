import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class SparkPostDriver implements EmailDriver {
  readonly id = "sparkpost";
  readonly name = "SparkPost";
  readonly defaultDailyCap = 15000;

  private apiKey: string;
  private endpoint: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("SparkPostDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
    this.endpoint =
      credentials.region === "eu"
        ? "https://api.eu.sparkpost.com/api/v1/transmissions"
        : "https://api.sparkpost.com/api/v1/transmissions";
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();

    const fromFormatted = message.from.name
      ? `"${message.from.name}" <${message.from.email}>`
      : message.from.email;

    const payload = {
      content: {
        from: fromFormatted,
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo,
        headers: message.headers,
        attachments: message.attachments?.map((att) => ({
          name: att.filename,
          type: att.contentType,
          data:
            typeof att.content === "string"
              ? att.content
              : Buffer.from(att.content).toString("base64")
        }))
      },
      recipients: message.to.map((t) => ({
        address: {
          email: t.email,
          name: t.name || undefined
        }
      }))
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`SparkPost API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { results?: { id?: string } };
    const messageId = data?.results?.id || `spk_${Date.now()}`;

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
