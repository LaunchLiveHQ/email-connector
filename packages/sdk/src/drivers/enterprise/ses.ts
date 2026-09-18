import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";
import { createHash, createHmac } from "node:crypto";

export class AwsSesDriver implements EmailDriver {
  readonly id = "aws_ses";
  readonly name = "AWS SES v2";
  readonly defaultDailyCap = 50000;

  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private sessionToken?: string;

  constructor(credentials: DriverCredentials) {
    const accessKeyId = credentials.accessKeyId || credentials.apiKey;
    const secretAccessKey = credentials.secretAccessKey || credentials.secretKey;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AwsSesDriver requires accessKeyId and secretAccessKey (or apiKey and secretKey).");
    }

    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = credentials.region || "us-east-1";
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    const endpoint = new URL(`https://email.${this.region}.amazonaws.com/v2/email/outbound-emails`);

    const fromFormatted = message.from.name
      ? `"${message.from.name}" <${message.from.email}>`
      : message.from.email;

    const payload = {
      FromEmailAddress: fromFormatted,
      Destination: {
        ToAddresses: message.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email))
      },
      ReplyToAddresses: message.replyTo ? [message.replyTo] : undefined,
      EmailTags: message.tags
        ? Object.entries(message.tags).map(([Name, Value]) => ({ Name, Value }))
        : undefined,
      Content: {
        Simple: {
          Subject: {
            Data: message.subject,
            Charset: "UTF-8"
          },
          Body: {
            Text: message.text ? { Data: message.text, Charset: "UTF-8" } : undefined,
            Html: message.html ? { Data: message.html, Charset: "UTF-8" } : undefined
          },
          Headers: message.headers
            ? Object.entries(message.headers).map(([Name, Value]) => ({ Name, Value }))
            : undefined,
          Attachments: message.attachments?.map((att) => ({
            FileName: att.filename,
            RawContent:
              typeof att.content === "string"
                ? att.content
                : Buffer.from(att.content).toString("base64"),
            ContentType: att.contentType,
            ContentTransferEncoding: "BASE64"
          }))
        }
      }
    };

    const body = JSON.stringify(payload);
    const headers = signAwsV4Request({
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      sessionToken: this.sessionToken,
      region: this.region,
      service: "ses",
      method: "POST",
      url: endpoint,
      body,
      headers: {
        "content-type": "application/json"
      }
    });

    const res = await fetch(endpoint.toString(), {
      method: "POST",
      headers,
      body
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`AWS SES API failed with status ${res.status}: ${errBody}`);
    }

    const data = (await res.json()) as { MessageId?: string };
    const messageId = data.MessageId || `ses_${Date.now()}`;

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
      const endpoint = new URL(`https://email.${this.region}.amazonaws.com/v2/email/account`);
      const headers = signAwsV4Request({
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        region: this.region,
        service: "ses",
        method: "GET",
        url: endpoint,
        body: "",
        headers: {}
      });

      const res = await fetch(endpoint.toString(), { method: "GET", headers });
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

export function signAwsV4Request(input: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
  service: string;
  method: string;
  url: URL;
  body: string;
  headers: Record<string, string>;
}): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = createHash("sha256").update(input.body).digest("hex");

  const requestHeaders: Record<string, string> = {
    ...input.headers,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    host: input.url.host
  };

  if (input.sessionToken) {
    requestHeaders["x-amz-security-token"] = input.sessionToken;
  }

  const sortedHeaderKeys = Object.keys(requestHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key.toLowerCase()}:${requestHeaders[key].trim()}\n`)
    .join("");
  const signedHeaders = sortedHeaderKeys.map((key) => key.toLowerCase()).join(";");

  const canonicalRequest = [
    input.method,
    input.url.pathname || "/",
    input.url.search ? input.url.search.slice(1) : "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const credentialScope = `${dateStamp}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex")
  ].join("\n");

  const kDate = createHmac("sha256", `AWS4${input.secretAccessKey}`).update(dateStamp).digest();
  const kRegion = createHmac("sha256", kDate).update(input.region).digest();
  const kService = createHmac("sha256", kRegion).update(input.service).digest();
  const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  return {
    ...requestHeaders,
    Authorization: `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  };
}
