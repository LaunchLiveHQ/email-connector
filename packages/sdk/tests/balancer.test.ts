import { describe, it, expect } from "vitest";
import { ZeroTrustBalancer } from "../src/balancer.js";
import { MemoryStorageAdapter } from "../src/storage/memory.js";
import { SendingServer } from "@emailconnector/config-schema";

describe("ZeroTrustBalancer", () => {
  it("rotates and enforces daily quota limits across multiple providers", async () => {
    const storage = new MemoryStorageAdapter();

    const mockServers: SendingServer[] = [
      {
        id: "srv_resend",
        name: "Primary Resend",
        driver: "resend",
        priority: 1,
        dailyLimit: 2, // Cap at 2 emails for test
        dailyUsed: 0,
        credentials: { apiKey: "re_mock_key" },
        isActive: true,
        isHealthy: true
      },
      {
        id: "srv_brevo",
        name: "Secondary Brevo",
        driver: "brevo",
        priority: 2,
        dailyLimit: 5,
        dailyUsed: 0,
        credentials: { apiKey: "br_mock_key" },
        isActive: true,
        isHealthy: true
      }
    ];

    // Mock global fetch for provider API calls
    global.fetch = async (url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes("resend.com")) {
        return new Response(JSON.stringify({ id: "resend_123" }), { status: 200 });
      }
      if (urlStr.includes("brevo.com")) {
        return new Response(JSON.stringify({ messageId: "brevo_456" }), { status: 200 });
      }
      return new Response("Not found", { status: 404 });
    };

    const balancer = new ZeroTrustBalancer({
      servers: mockServers,
      storage
    });

    const email = {
      to: [{ email: "test@example.com" }],
      from: { email: "sender@example.com" },
      subject: "Hello from EmailConnector",
      text: "Test body"
    };

    // 1st Send -> Resend (Priority 1)
    const res1 = await balancer.send(email);
    expect(res1.status).toBe("sent");
    expect(res1.provider).toBe("resend");

    // 2nd Send -> Resend (Priority 1)
    const res2 = await balancer.send(email);
    expect(res2.status).toBe("sent");
    expect(res2.provider).toBe("resend");

    // 3rd Send -> Resend quota is full (2/2), automatically cascades to Brevo (Priority 2)
    const res3 = await balancer.send(email);
    expect(res3.status).toBe("sent");
    expect(res3.provider).toBe("brevo");

    // Check quota status
    const quotas = await balancer.getQuotaStatus();
    expect(quotas[0].used).toBe(2);
    expect(quotas[0].remaining).toBe(0);
    expect(quotas[1].used).toBe(1);
    expect(quotas[1].remaining).toBe(4);
  });

  it("cascades immediately to Priority 2 when Priority 1 fails with 429 Too Many Requests", async () => {
    const storage = new MemoryStorageAdapter();

    const mockServers: SendingServer[] = [
      {
        id: "srv_resend",
        name: "Primary Resend",
        driver: "resend",
        priority: 1,
        dailyLimit: 100,
        dailyUsed: 0,
        credentials: { apiKey: "re_mock_key" },
        isActive: true,
        isHealthy: true
      },
      {
        id: "srv_brevo",
        name: "Secondary Brevo",
        driver: "brevo",
        priority: 2,
        dailyLimit: 300,
        dailyUsed: 0,
        credentials: { apiKey: "br_mock_key" },
        isActive: true,
        isHealthy: true
      }
    ];

    // Simulate Resend returning 429 rate limit
    global.fetch = async (url: any) => {
      const urlStr = url.toString();
      if (urlStr.includes("resend.com")) {
        return new Response("Too Many Requests", { status: 429 });
      }
      if (urlStr.includes("brevo.com")) {
        return new Response(JSON.stringify({ messageId: "brevo_fallback_ok" }), { status: 200 });
      }
      return new Response("Not found", { status: 404 });
    };

    const balancer = new ZeroTrustBalancer({
      servers: mockServers,
      storage
    });

    const res = await balancer.send({
      to: [{ email: "user@example.com" }],
      from: { email: "orders@brand.com" },
      subject: "Order Confirmation",
      text: "Thank you for your order."
    });

    expect(res.status).toBe("sent");
    expect(res.provider).toBe("brevo"); // Successfully cascaded
    expect(res.attempts.length).toBe(2);
    expect(res.attempts[0].provider).toBe("resend");
    expect(res.attempts[0].status).toBe("failed");
    expect(res.attempts[1].provider).toBe("brevo");
    expect(res.attempts[1].status).toBe("success");
  });
});
