import { EmailDriver, RateLimitInfo } from "../driver.js";
import {
  UnifiedEmailPayload,
  SendResult,
  DriverCredentials
} from "@emailconnector/config-schema";

export class AwsSesDriver implements EmailDriver {
  readonly id = "aws_ses";
  readonly name = "AWS SES";
  readonly defaultDailyCap = 50000;

  private accessKeyId?: string;
  private secretAccessKey?: string;
  private region: string;

  constructor(credentials: DriverCredentials) {
    this.accessKeyId = credentials.accessKeyId || credentials.apiKey;
    this.secretAccessKey = credentials.secretAccessKey || credentials.secretKey;
    this.region = credentials.region || "us-east-1";
  }

  async send(message: UnifiedEmailPayload): Promise<SendResult> {
    const startTime = Date.now();
    // Simulate AWS SES v2 SendEmail command
    const messageId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const latencyMs = Date.now() - startTime;

    return {
      status: "sent",
      messageId,
      provider: this.id,
      latencyMs: Math.max(latencyMs, 45),
      attempts: [{ provider: this.id, status: "success", statusCode: 200 }]
    };
  }

  async verifyCredentials(): Promise<boolean> {
    return Boolean(this.accessKeyId && this.secretAccessKey);
  }

  async getRateLimitStatus(): Promise<RateLimitInfo> {
    return {
      dailyLimit: this.defaultDailyCap,
      dailyUsed: 0,
      resetAt: Date.now() + 86400000
    };
  }
}
