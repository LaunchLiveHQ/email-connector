import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class SendGridDriver implements EmailDriver {
  readonly id = "sendgrid";
  readonly name = "Twilio SendGrid";
  readonly defaultDailyCap = 100; // 100/day free limit (3,000/mo)

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey) {
      throw new Error("SendGridDriver requires an apiKey");
    }
    this.apiKey = credentials.apiKey;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.sendgrid.com/v3/mail/send";

    const content = [];
    if (message.text) {
      content.push({ type: "text/plain", value: message.text });
    }
    if (message.html) {
      content.push({ type: "text/html", value: message.html });
    }
    if (content.length === 0) {
      content.push({ type: "text/plain", value: "" });
    }

    const payload = {
      personalizations: [
        {
          to: message.to.map((t) => ({ email: t.email, name: t.name || undefined }))
        }
      ],
      from: {
        email: message.from.email,
        name: message.from.name || undefined
      },
      subject: message.subject,
      content,
      reply_to: message.replyTo ? { email: message.replyTo } : undefined
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
      throw new Error(`SendGrid API failed with status ${res.status}: ${errBody}`);
    }

    const messageId = res.headers.get("x-message-id") || `sg_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/scopes", {
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
