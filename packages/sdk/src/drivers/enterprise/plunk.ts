import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class PlunkDriver implements EmailDriver {
  readonly id = "plunk";
  readonly name = "Plunk";
  readonly defaultDailyCap = 5000;

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("PlunkDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.useplunk.com/v1/send";

    // Plunk supports direct recipient string or primary recipient
    const to = message.to.map((t) => t.email).join(",");

    const payload = {
      to,
      subject: message.subject,
      body: message.html || message.text || "",
      from: message.from.email,
      name: message.from.name,
      reply: message.replyTo,
      headers: message.headers,
      attachments: message.attachments?.map((att) => ({
        filename: att.filename,
        content:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64")
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
      throw new Error(`Plunk API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { id?: string; success?: boolean };
    const messageId = data?.id || `plunk_${Date.now()}`;

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
