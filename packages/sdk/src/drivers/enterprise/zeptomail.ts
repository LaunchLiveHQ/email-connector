import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class ZeptoMailDriver implements EmailDriver {
  readonly id = "zeptomail";
  readonly name = "ZeptoMail (Zoho)";
  readonly defaultDailyCap = 333; // 10k free credits test tier (~333/day)

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey) {
      throw new Error("ZeptoMailDriver requires an apiKey (Send Mail Token)");
    }
    this.apiKey = credentials.apiKey;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://api.zeptomail.com/v1.1/email";

    const payload = {
      from: {
        address: message.from.email,
        name: message.from.name || undefined
      },
      to: message.to.map((t) => ({
        email_address: { address: t.email, name: t.name || undefined }
      })),
      subject: message.subject,
      htmlbody: message.html,
      textbody: message.text
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`ZeptoMail API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as any;
    const messageId = data?.data?.[0]?.message_id || `zm_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
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
