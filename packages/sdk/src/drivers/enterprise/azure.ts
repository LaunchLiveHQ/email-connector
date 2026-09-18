import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";
import { createHash, createHmac } from "node:crypto";

export class AzureCommunicationDriver implements EmailDriver {
  readonly id = "azure";
  readonly name = "Azure Communication Services";
  readonly defaultDailyCap = 50000;

  private endpoint: string;
  private accessKey: string;
  private apiVersion: string;

  constructor(credentials: DriverCredentials) {
    if (credentials.connectionString) {
      const parsed = parseAzureConnectionString(credentials.connectionString);
      this.endpoint = parsed.endpoint;
      this.accessKey = parsed.accessKey;
    } else {
      this.endpoint = credentials.endpoint || "";
      this.accessKey = credentials.apiKey || credentials.secretKey || "";
    }

    if (!this.endpoint || !this.accessKey) {
      throw new Error(
        "AzureCommunicationDriver requires a connectionString or both endpoint and apiKey/accessKey."
      );
    }

    this.endpoint = this.endpoint.replace(/\/+$/, "");
    this.apiVersion = "2025-09-01";
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const url = new URL(`${this.endpoint}/emails:send?api-version=${this.apiVersion}`);

    const payload = {
      senderAddress: message.from.email,
      content: {
        subject: message.subject,
        plainText: message.text || "",
        html: message.html
      },
      recipients: {
        to: message.to.map((t) => ({
          address: t.email,
          displayName: t.name || undefined
        }))
      },
      replyTo: message.replyTo ? [{ address: message.replyTo }] : undefined,
      attachments: message.attachments?.map((att) => ({
        name: att.filename,
        contentType: att.contentType,
        contentInBase64:
          typeof att.content === "string"
            ? att.content
            : Buffer.from(att.content).toString("base64")
      }))
    };

    const body = JSON.stringify(payload);
    const headers = signAzureRequest({
      endpoint: this.endpoint,
      accessKey: this.accessKey,
      method: "POST",
      url,
      body
    });

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok && res.status !== 202) {
      const errBody = await res.text();
      throw new Error(`Azure Communication API failed with status ${res.status}: ${errBody}`);
    }

    let messageId = `azure_${Date.now()}`;
    try {
      const data = (await res.json()) as { id?: string };
      if (data?.id) messageId = data.id;
    } catch {
      // 202 without body or operation header
      const opLocation = res.headers.get("operation-location");
      if (opLocation) {
        const parts = opLocation.split("/");
        messageId = parts[parts.length - 1] || messageId;
      }
    }

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs,
      attempts: [{ provider: this.id, status: "success", statusCode: res.status, durationMs: latencyMs }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return Boolean(this.endpoint && this.accessKey);
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}

export function parseAzureConnectionString(connStr: string): { endpoint: string; accessKey: string } {
  const parts = connStr.split(";");
  let endpoint = "";
  let accessKey = "";

  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    const v = rest.join("=");
    if (!k) continue;
    if (k.trim().toLowerCase() === "endpoint") endpoint = v.trim();
    if (k.trim().toLowerCase() === "accesskey") accessKey = v.trim();
  }

  return { endpoint, accessKey };
}

export function signAzureRequest(input: {
  endpoint: string;
  accessKey: string;
  method: string;
  url: URL;
  body: string;
}): Record<string, string> {
  const date = new Date().toUTCString();
  const host = input.url.host;
  const contentHash = createHash("sha256").update(input.body, "utf8").digest("base64");
  const pathAndQuery = `${input.url.pathname}${input.url.search}`;

  const stringToSign = `${input.method.toUpperCase()}\n${pathAndQuery}\n${date};${host};${contentHash}`;

  const keyBuffer = Buffer.from(input.accessKey, "base64");
  const signature = createHmac("sha256", keyBuffer).update(stringToSign, "utf8").digest("base64");

  return {
    "content-type": "application/json",
    "x-ms-date": date,
    "x-ms-content-sha256": contentHash,
    host,
    Authorization: `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}`
  };
}
