import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class BrevoDriver implements EmailDriver {
  readonly id = "brevo";
  readonly name = "Brevo";
  readonly defaultDailyCap = 300; // 300/day free limit (9,000/mo)

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey) {
      throw new Error("BrevoDriver requires an apiKey");
    }
    this.apiKey = credentials.apiKey;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.brevo.com/v3/smtp/email";

    const payload = {
      sender: {
        name: message.from.name || undefined,
        email: message.from.email
      },
      to: message.to.map((t) => ({ name: t.name || undefined, email: t.email })),
      subject: message.subject,
      htmlContent: message.html,
      textContent: message.text,
      replyTo: message.replyTo ? { email: message.replyTo } : undefined,
      headers: message.headers,
      tags: message.tags ? Object.values(message.tags) : undefined
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Brevo API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { messageId: string };

    return {
      status: "sent",
      messageId: data.messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": this.apiKey }
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
