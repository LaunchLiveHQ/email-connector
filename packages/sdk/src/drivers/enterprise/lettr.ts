import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class LettrDriver implements EmailDriver {
  readonly id = "lettr";
  readonly name = "Lettr";
  readonly defaultDailyCap = 5000;

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("LettrDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://app.lettr.com/api/v1/send";

    const payload = {
      from: message.from.name ? `${message.from.name} <${message.from.email}>` : message.from.email,
      to: message.to.map((t) => (t.name ? `${t.name} <${t.email}>` : t.email)),
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo,
      headers: message.headers
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
      throw new Error(`Lettr API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { data?: { request_id?: string } };
    const messageId = data?.data?.request_id || `ltr_${Date.now()}`;

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
