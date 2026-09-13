import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class PostmarkDriver implements EmailDriver {
  readonly id = "postmark";
  readonly name = "Postmark";
  readonly defaultDailyCap = 1000;

  private serverToken: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.serverToken && !credentials.apiKey) {
      throw new Error("PostmarkDriver requires a serverToken or apiKey");
    }
    this.serverToken = credentials.serverToken || credentials.apiKey!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.postmarkapp.com/email";

    const payload = {
      From: message.from.name
        ? `${message.from.name} <${message.from.email}>`
        : message.from.email,
      To: message.to.map((t) => (t.name ? `${t.name} <${t.email}>` : t.email)).join(", "),
      Subject: message.subject,
      HtmlBody: message.html,
      TextBody: message.text,
      ReplyTo: message.replyTo,
      Headers: message.headers
        ? Object.entries(message.headers).map(([Name, Value]) => ({ Name, Value }))
        : undefined
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": this.serverToken,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Postmark API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as any;
    const messageId = data?.MessageID || `pm_${Date.now()}`;

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
      const res = await fetch("https://api.postmarkapp.com/server", {
        headers: { "X-Postmark-Server-Token": this.serverToken }
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
