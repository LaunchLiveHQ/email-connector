import { describe, it, expect } from "vitest";
import { createDriver, createDriverFromServer } from "../src/drivers/factory.js";
import { DriverType } from "@emailconnector/config-schema";

describe("Driver Factory (Complete 30-Driver Fleet)", () => {
  const driverTypes: Array<{ type: DriverType; expectedId: string }> = [
    // Core
    { type: "resend", expectedId: "resend" },
    { type: "brevo", expectedId: "brevo" },
    { type: "mailjet", expectedId: "mailjet" },
    { type: "mailersend", expectedId: "mailersend" },
    { type: "sendgrid", expectedId: "sendgrid" },
    { type: "smtp", expectedId: "smtp" },
    // Enterprise & Modern ESPs
    { type: "sendpulse", expectedId: "sendpulse" },
    { type: "aws_ses", expectedId: "aws_ses" },
    { type: "azure", expectedId: "azure" },
    { type: "smtp2go", expectedId: "smtp2go" },
    { type: "postmark", expectedId: "postmark" },
    { type: "zeptomail", expectedId: "zeptomail" },
    { type: "mailgun", expectedId: "mailgun" },
    { type: "mailtrap", expectedId: "mailtrap" },
    { type: "scaleway", expectedId: "scaleway" },
    { type: "plunk", expectedId: "plunk" },
    { type: "loops", expectedId: "loops" },
    { type: "sparkpost", expectedId: "sparkpost" },
    { type: "mandrill", expectedId: "mandrill" },
    { type: "mailpace", expectedId: "mailpace" },
    { type: "cloudflare", expectedId: "cloudflare" },
    { type: "iterable", expectedId: "iterable" },
    { type: "jetemail", expectedId: "jetemail" },
    { type: "lettermint", expectedId: "lettermint" },
    { type: "lettr", expectedId: "lettr" },
    { type: "sequenzy", expectedId: "sequenzy" },
    { type: "unosend", expectedId: "unosend" },
    { type: "primitive", expectedId: "primitive" },
    { type: "ahasend", expectedId: "ahasend" },
    { type: "mailchannels", expectedId: "mailchannels" }
  ];

  it("instantiates each of the 30 real drivers with proper credentials", () => {
    for (const { type, expectedId } of driverTypes) {
      const driver = createDriver(type, {
        apiKey: "test_key_123",
        secretKey: "test_secret_123",
        accessKeyId: "test_access_key",
        secretAccessKey: "test_secret_access",
        domain: "launchlive.com",
        host: "smtp.example.com",
        endpoint: "https://example.communication.azure.com",
        user: "testuser",
        password: "testpassword"
      });

      expect(driver.id).toBe(expectedId);
      expect(typeof driver.send).toBe("function");
      expect(typeof driver.verifyCredentials).toBe("function");
      expect(typeof driver.getRateLimitStatus).toBe("function");
    }
  });

  it("instantiates driver from server configuration object", () => {
    const server = {
      id: "srv_sp_1",
      driver: "sendpulse",
      credentials: {
        apiKey: "sp_key_999"
      }
    };

    const driver = createDriverFromServer(server);
    expect(driver.id).toBe("sendpulse");
  });
});
