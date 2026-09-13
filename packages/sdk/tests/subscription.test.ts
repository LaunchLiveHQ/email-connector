import { describe, it, expect } from "vitest";
import { SubscriptionVerifier } from "../src/subscription.js";

describe("SubscriptionVerifier", () => {
  it("defaults to free core drivers when no subscriptionId is provided", async () => {
    const verifier = new SubscriptionVerifier();
    const result = await verifier.verify();

    expect(result.isValid).toBe(false);
    expect(result.tier).toBe("free");
    expect(result.allowedDrivers).toContain("resend");
    expect(result.allowedDrivers).toContain("brevo");
    expect(result.allowedDrivers).toContain("sendgrid");
    expect(result.allowedDrivers).not.toContain("postmark");
  });

  it("unlocks 25+ Enterprise drivers when valid test enterprise key is provided", async () => {
    const verifier = new SubscriptionVerifier({ subscriptionId: "ec_test_enterprise" });
    const result = await verifier.verify();

    expect(result.isValid).toBe(true);
    expect(result.tier).toBe("enterprise");
    expect(result.allowedDrivers).toContain("postmark");
    expect(result.allowedDrivers).toContain("aws_ses");
    expect(result.allowedDrivers).toContain("zeptomail");
    expect(result.allowedDrivers).toContain("mailtrap");

    const isPostmarkAllowed = await verifier.isDriverAllowed("postmark");
    expect(isPostmarkAllowed).toBe(true);
  });
});
