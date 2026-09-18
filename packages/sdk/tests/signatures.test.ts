import { describe, it, expect } from "vitest";
import { signAwsV4Request } from "../src/drivers/enterprise/ses.js";
import { signAzureRequest, parseAzureConnectionString } from "../src/drivers/enterprise/azure.js";

describe("Cryptographic Request Signing (Zero-Dependency)", () => {
  it("generates valid AWS Signature V4 authorization header for SES v2", () => {
    const headers = signAwsV4Request({
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      region: "us-east-1",
      service: "ses",
      method: "POST",
      url: new URL("https://email.us-east-1.amazonaws.com/v2/email/outbound-emails"),
      body: JSON.stringify({ test: "payload" }),
      headers: { "content-type": "application/json" }
    });

    expect(headers.Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE\/\d{8}\/us-east-1\/ses\/aws4_request, SignedHeaders=/);
    expect(headers.Authorization).toContain("Signature=");
    expect(headers["x-amz-date"]).toBeDefined();
    expect(headers["x-amz-content-sha256"]).toBeDefined();
    expect(headers.host).toBe("email.us-east-1.amazonaws.com");
  });

  it("parses Azure connection string and generates HMAC-SHA256 headers", () => {
    const rawKey = Buffer.from("super-secret-azure-access-key-12345").toString("base64");
    const connStr = `endpoint=https://my-comm-resource.communication.azure.com;accesskey=${rawKey}`;

    const parsed = parseAzureConnectionString(connStr);
    expect(parsed.endpoint).toBe("https://my-comm-resource.communication.azure.com");
    expect(parsed.accessKey).toBe(rawKey);

    const headers = signAzureRequest({
      endpoint: parsed.endpoint,
      accessKey: parsed.accessKey,
      method: "POST",
      url: new URL(`${parsed.endpoint}/emails:send?api-version=2025-09-01`),
      body: JSON.stringify({ message: "hello" })
    });

    expect(headers.Authorization).toMatch(/^HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=/);
    expect(headers["x-ms-date"]).toBeDefined();
    expect(headers["x-ms-content-sha256"]).toBeDefined();
    expect(headers.host).toBe("my-comm-resource.communication.azure.com");
  });
});
