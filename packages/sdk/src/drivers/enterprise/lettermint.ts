import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class LettermintDriver implements EmailDriver {
  readonly id = "lettermint";
  readonly name = "Lettermint";
  readonly defaultDailyCap = 5000;

  private apiToken: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("LettermintDriver requires an apiToken (apiKey or serverToken).");
    }
    this.apiToken = credentials.apiKey || credentials.serverToken!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.lettermint.co/v1/send";

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
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Lettermint API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { message_id?: string; id?: string };
    const messageId = data?.message_id || data?.id || `ltm_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return Boolean(this.apiToken);
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}
