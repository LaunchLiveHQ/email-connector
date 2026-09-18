import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class SendPulseDriver implements EmailDriver {
  readonly id = "sendpulse";
  readonly name = "SendPulse REST / Transactional SMTP";
  readonly defaultDailyCap = 12000;

  private apiKey?: string;
  private clientId?: string;
  private clientSecret?: string;
  private cachedToken?: string;
  private tokenExpiresAt = 0;

  constructor(credentials: DriverCredentials) {
    this.apiKey = credentials.apiKey || credentials.serverToken;
    this.clientId = credentials.clientId || credentials.user;
    this.clientSecret = credentials.clientSecret || credentials.password;

    if (!this.apiKey && (!this.clientId || !this.clientSecret)) {
      throw new Error(
        "SendPulseDriver requires an apiKey/serverToken or clientId and clientSecret."
      );
    }
  }

  private async getBearerToken(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const tokenRes = await fetch("https://api.sendpulse.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`SendPulse OAuth token exchange failed with status ${tokenRes.status}: ${errText}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string; expires_in?: number };
    this.cachedToken = tokenData.access_token;
    const expiresInSec = tokenData.expires_in || 3600;
    this.tokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;

    return this.cachedToken;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const token = await this.getBearerToken();

    const attachmentsBinary: Record<string, string> = {};
    if (message.attachments) {
      for (const att of message.attachments) {
        attachmentsBinary[att.filename] =
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64");
      }
    }

    const payload = {
      email: {
        subject: message.subject,
        text: message.text || "",
        html: message.html ? Buffer.from(message.html).toString("base64") : undefined,
        auto_plain_text: !message.text && Boolean(message.html),
        from: {
          name: message.from.name || "",
          email: message.from.email
        },
        to: message.to.map((t) => ({
          name: t.name || "",
          email: t.email
        })),
        reply_to: message.replyTo ? { name: "", email: message.replyTo } : undefined,
        attachments_binary: Object.keys(attachmentsBinary).length > 0 ? attachmentsBinary : undefined
      }
    };

    const res = await fetch("https://api.sendpulse.com/smtp/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`SendPulse API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { result: boolean; id?: string };
    const messageId = data.id || `sp_${Date.now()}`;

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
      const token = await this.getBearerToken();
      const res = await fetch("https://api.sendpulse.com/smtp/senders", {
        headers: { Authorization: `Bearer ${token}` }
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
