import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class LoopsDriver implements EmailDriver {
  readonly id = "loops";
  readonly name = "Loops";
  readonly defaultDailyCap = 5000;

  private apiKey: string;
  private transactionalId?: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.apiKey && !credentials.serverToken) {
      throw new Error("LoopsDriver requires an apiKey or serverToken.");
    }
    this.apiKey = credentials.apiKey || credentials.serverToken!;
    this.transactionalId = credentials.domain;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = "https://app.loops.so/api/v1/transactional";

    const payload = {
      transactionalId: this.transactionalId || "default",
      email: message.to[0].email,
      dataVariables: {
        subject: message.subject,
        content: message.html || message.text || "",
        ...(message.tags || {})
      },
      attachments: message.attachments?.map((att) => ({
        filename: att.filename,
        contentType: att.contentType,
        data:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64")
      }))
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
      throw new Error(`Loops API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { success?: boolean; id?: string };
    const messageId = data?.id || `loops_${Date.now()}`;

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
      const res = await fetch("https://app.loops.so/api/v1/api-key", {
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
