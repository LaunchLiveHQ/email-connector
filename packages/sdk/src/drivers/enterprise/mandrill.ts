import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class MandrillDriver implements EmailDriver {
  readonly id = "mandrill";
  readonly name = "Mailchimp Mandrill";
  readonly defaultDailyCap = 10000;

  private apiKey: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("MandrillDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://mandrillapp.com/api/1.0/messages/send";

    const payload = {
      key: this.apiKey,
      message: {
        from_email: message.from.email,
        from_name: message.from.name || undefined,
        to: message.to.map((t) => ({
          email: t.email,
          name: t.name || undefined,
          type: "to"
        })),
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: {
          ...(message.replyTo ? { "Reply-To": message.replyTo } : {}),
          ...(message.headers || {})
        },
        attachments: message.attachments?.map((att) => ({
          type: att.contentType,
          name: att.filename,
          content:
            typeof att.content === "string"
              ? att.content
              : Buffer.from(att.content).toString("base64")
        }))
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Mandrill API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as Array<{ _id?: string; status?: string }>;
    const messageId = data?.[0]?._id || `man_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      const res = await fetch("https://mandrillapp.com/api/1.0/users/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: this.apiKey })
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
