import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class ResendDriver implements EmailDriver {
  readonly id = "resend";
  readonly name = "Resend";
  readonly defaultDailyCap = 100; // 100/day free limit (3,000/mo)

  private apiKey: string;
  private customDomain?: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey) {
      throw new Error("ResendDriver requires an apiKey");
    }
    this.apiKey = credentials.apiKey;
    this.customDomain = credentials.domain;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.resend.com/emails";

    const payload = {
      from: message.from.name
        ? `${message.from.name} <${message.from.email}>`
        : message.from.email,
      to: message.to.map((t) => (t.name ? `${t.name} <${t.email}>` : t.email)),
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo,
      headers: message.headers,
      tags: message.tags
        ? Object.entries(message.tags).map(([name, value]) => ({ name, value }))
        : undefined
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
      throw new Error(`Resend API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { id: string };

    return {
      status: "sent",
      messageId: data.id,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const res = await fetch("https://api.resend.com/api-keys", {
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
