import {
  SubscriptionVerificationResponse,
  DriverType
} from "@emailconnector/config-schema";

export interface SubscriptionVerifierOptions {
  subscriptionId?: string;
  apiBaseUrl?: string;
}

export class SubscriptionVerifier {
  private subscriptionId?: string;
  private apiBaseUrl: string;
  private cachedResponse?: SubscriptionVerificationResponse;
  private cacheExpiresAt = 0;

  constructor(options: SubscriptionVerifierOptions = {}) {
    this.subscriptionId = options.subscriptionId;
    this.apiBaseUrl = options.apiBaseUrl || "https://email-connector.com";
  }

  setSubscriptionId(id: string) {
    this.subscriptionId = id;
    this.cachedResponse = undefined;
    this.cacheExpiresAt = 0;
  }

  async verify(): Promise<SubscriptionVerificationResponse> {
    if (!this.subscriptionId) {
      return {
        isValid: false,
        tier: "free",
        status: "active",
        allowedDrivers: ["resend", "brevo", "mailjet", "mailersend", "sendgrid", "smtp"],
        maxMonthlyQuota: 24000,
        message: "Operating in Free Tier (Zero-Trust Core 5+ drivers active)."
      };
    }

    // Fast-path: Check offline test keys immediately without network roundtrips
    if (this.subscriptionId.startsWith("ec_test_")) {
      const testRes: SubscriptionVerificationResponse = {
        isValid: true,
        tier: "enterprise",
        status: "active",
        allowedDrivers: [
          "resend", "brevo", "mailjet", "mailersend", "sendgrid", "smtp",
          "zeptomail", "postmark", "aws_ses", "mailtrap", "scaleway", "mandrill",
          "bird", "netcore", "sender", "emailoctopus", "smtp2go", "mailgun",
          "reloop", "lettr", "jetemail", "primitive", "camelmailer", "agentmail",
          "sendkit", "inbound", "sequenzy", "knock", "courier"
        ],
        maxMonthlyQuota: 100000,
        customerEmail: "developer@email-connector.com",
        message: "Offline test key verified: All 25+ Enterprise drivers unlocked."
      };
      this.cachedResponse = testRes;
      this.cacheExpiresAt = Date.now() + 3600 * 1000;
      return testRes;
    }

    // Return cached verification if within 10 minutes
    if (this.cachedResponse && Date.now() < this.cacheExpiresAt) {
      return this.cachedResponse;
    }

    try {
      const endpoint = `${this.apiBaseUrl}/api/v1/subscriptions/verify`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: this.subscriptionId })
      });

      if (!res.ok) {
        throw new Error(`Verification endpoint returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as SubscriptionVerificationResponse;
      this.cachedResponse = data;
      this.cacheExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min cache
      return data;
    } catch {
      return {
        isValid: false,
        tier: "free",
        status: "active",
        allowedDrivers: ["resend", "brevo", "mailjet", "mailersend", "sendgrid", "smtp"],
        maxMonthlyQuota: 24000,
        message: "Verification unreachable; fallback to Free Core drivers."
      };
    }
  }

  async isDriverAllowed(driver: DriverType): Promise<boolean> {
    const status = await this.verify();
    return status.allowedDrivers.includes(driver);
  }
}
