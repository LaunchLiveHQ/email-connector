import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class IterableDriver implements EmailDriver {
  readonly id = "iterable";
  readonly name = "Iterable";
  readonly defaultDailyCap = 25000;

  private apiKey: string;
  private campaignId: number;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("IterableDriver requires an apiKey.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
    this.campaignId = Number(credentials.domain || credentials.region) || 1000;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.iterable.com/api/email/target";

    const payload = {
      campaignId: this.campaignId,
      recipientEmail: message.to[0].email,
      dataFields: {
        subject: message.subject,
        html: message.html,
        text: message.text,
        senderName: message.from.name,
        senderEmail: message.from.email,
        ...(message.tags || {})
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Api-Key": this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Iterable API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { msg?: string; params?: { messageId?: string } };
    const messageId = data?.params?.messageId || `iter_${Date.now()}`;

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
