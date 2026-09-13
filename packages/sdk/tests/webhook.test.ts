import { describe, it, expect } from "vitest";
import { WebhookSignature } from "../src/webhooks/signature.js";

describe("WebhookSignature", () => {
  const secret = "whsec_test_secret_key_123456789";
  const payload = JSON.stringify({
    event: "checkout.abandoned",
    cartId: "cart_abc_123",
    customerEmail: "shopper@example.com",
    cartTotal: 129.99
  });

  it("successfully signs and verifies a valid webhook payload", () => {
    const signatureHeader = WebhookSignature.sign(payload, secret);
    expect(signatureHeader).toContain("t=");
    expect(signatureHeader).toContain("v1=");

    const isValid = WebhookSignature.verify({
      secret,
      payload,
      headers: { "webhook-signature": signatureHeader }
    });

    expect(isValid).toBe(true);
  });

  it("rejects signatures with mismatched payload content", () => {
    const signatureHeader = WebhookSignature.sign(payload, secret);
    const tamperedPayload = payload.replace("129.99", "9.99");

    const isValid = WebhookSignature.verify({
      secret,
      payload: tamperedPayload,
      headers: { "webhook-signature": signatureHeader }
    });

    expect(isValid).toBe(false);
  });

  it("rejects expired webhook signatures (anti-replay window exceeded)", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const signatureHeader = WebhookSignature.sign(payload, secret, pastTimestamp);

    const isValid = WebhookSignature.verify({
      secret,
      payload,
      headers: { "webhook-signature": signatureHeader },
      toleranceSeconds: 300 // 5 minutes tolerance
    });

    expect(isValid).toBe(false);
  });
});
