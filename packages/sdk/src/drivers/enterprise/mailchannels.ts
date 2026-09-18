import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class MailChannelsDriver implements EmailDriver {
  readonly id = "mailchannels";
  readonly name = "MailChannels";
  readonly defaultDailyCap = 10000;

  private apiKey?: string;

  constructor(credentials: DriverCredentials) {
    this.apiKey = credentials.apiKey || credentials.serverToken;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.mailchannels.net/tx/v1/send";

    const payload = {
      personalizations: [
        {
          to: message.to.map((t) => ({ email: t.email, name: t.name })),
          reply_to: message.replyTo ? { email: message.replyTo } : undefined
        }
      ],
      from: {
        email: message.from.email,
        name: message.from.name
      },
      subject: message.subject,
      content: [
        ...(message.text ? [{ type: "text/plain", value: message.text }] : []),
        ...(message.html ? [{ type: "text/html", value: message.html }] : [])
      ],
      headers: message.headers
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok && res.status !== 202) {
      const errBody = await res.text();
      throw new Error(`MailChannels API failed with status ${res.status}: ${errBody}`);
    }

    const messageId = `mc_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return true;
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}
