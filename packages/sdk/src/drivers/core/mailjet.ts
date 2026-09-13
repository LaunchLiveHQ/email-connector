import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class MailjetDriver implements EmailDriver {
  readonly id = "mailjet";
  readonly name = "Mailjet";
  readonly defaultDailyCap = 200; // 200/day free limit (6,000/mo)

  private apiKey: string;
  private secretKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey || !credentials.secretKey) {
      throw new Error("MailjetDriver requires both apiKey and secretKey");
    }
    this.apiKey = credentials.apiKey;
    this.secretKey = credentials.secretKey;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.mailjet.com/v3.1/send";

    const authHeader = `Basic ${Buffer.from(`${this.apiKey}:${this.secretKey}`).toString("base64")}`;

    const payload = {
      Messages: [
        {
          From: {
            Email: message.from.email,
            Name: message.from.name || undefined
          },
          To: message.to.map((t) => ({ Email: t.email, Name: t.name || undefined })),
          Subject: message.subject,
          HTMLPart: message.html,
          TextPart: message.text,
          Headers: message.headers
        }
      ]
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Mailjet API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as any;
    const msgId = data?.Messages?.[0]?.To?.[0]?.MessageID?.toString() || `mj_${Date.now()}`;

    return {
      status: "sent",
      messageId: msgId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const authHeader = `Basic ${Buffer.from(`${this.apiKey}:${this.secretKey}`).toString("base64")}`;
      const res = await fetch("https://api.mailjet.com/v3/REST/user", {
        headers: { Authorization: authHeader }
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
