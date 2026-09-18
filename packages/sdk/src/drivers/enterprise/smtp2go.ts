import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class Smtp2goDriver implements EmailDriver {
  readonly id = "smtp2go";
  readonly name = "SMTP2GO API";
  readonly defaultDailyCap = 10000;

  private apiKey: string;
  private endpoint: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("Smtp2goDriver requires an apiKey or serverToken.");
    }

    this.apiKey = credentials.apiKey || credentials.serverToken!;

    if (credentials.region === "eu") {
      this.endpoint = "https://eu-api.smtp2go.com/v3/email/send";
    } else if (credentials.region === "au") {
      this.endpoint = "https://au-api.smtp2go.com/v3/email/send";
    } else if (credentials.region === "us") {
      this.endpoint = "https://us-api.smtp2go.com/v3/email/send";
    } else {
      this.endpoint = "https://api.smtp2go.com/v3/email/send";
    }
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();

    const payload = {
      api_key: this.apiKey,
      sender: message.from.name
        ? `"${message.from.name}" <${message.from.email}>`
        : message.from.email,
      to: message.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)),
      subject: message.subject,
      html_body: message.html,
      text_body: message.text,
      custom_headers: message.headers
        ? Object.entries(message.headers).map(([header, value]) => ({ header, value }))
        : undefined,
      attachments: message.attachments?.map((att) => ({
        filename: att.filename,
        fileblob:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64"),
        mimetype: att.contentType
      }))
    };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`SMTP2GO API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { data?: { succeeded?: number; email_id?: string; failed?: number } };
    const messageId = data?.data?.email_id || `s2g_${Date.now()}`;

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
      const res = await fetch("https://api.smtp2go.com/v3/stats/email_cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: this.apiKey })
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
