import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class ScalewayDriver implements EmailDriver {
  readonly id = "scaleway";
  readonly name = "Scaleway Transactional Email";
  readonly defaultDailyCap = 10000;

  private secretKey: string;
  private region: string;
  private projectId?: string;

  constructor(credentials: DriverCredentials) {
    if (!credentials.secretKey && !credentials.apiKey) {
      throw new Error("ScalewayDriver requires a secretKey or apiKey.");
    }
    this.secretKey = credentials.secretKey || credentials.apiKey!;
    this.region = credentials.region || "fr-par";
    this.projectId = credentials.serverToken || credentials.domain;
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = `https://api.scaleway.com/transactional-email/v1alpha1/regions/${this.region}/emails`;

    const payload = {
      project_id: this.projectId,
      from: {
        email: message.from.email,
        name: message.from.name || undefined
      },
      to: message.to.map((t) => ({
        email: t.email,
        name: t.name || undefined
      })),
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map((att) => ({
        name: att.filename,
        type: att.contentType,
        content:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64")
      }))
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Auth-Token": this.secretKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Scaleway API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { emails?: Array<{ id?: string }> };
    const messageId = data?.emails?.[0]?.id || `scw_${Date.now()}`;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return Boolean(this.secretKey);
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}
