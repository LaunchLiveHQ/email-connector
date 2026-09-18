import { describe, it, expect } from "vitest";
import net from "node:net";
import { SmtpDriver, buildMimePayload } from "../src/drivers/core/smtp.js";
import { UnifiedEmailPayload } from "@emailconnector/config-schema";

describe("SmtpDriver (Zero-Dependency Node Socket Client)", () => {
  it("builds valid RFC 5322 MIME payloads with headers and multipart alternative", () => {
    const payload: UnifiedEmailPayload = {
      from: { email: "sender@example.com", name: "Sender Team" },
      to: [{ email: "receiver@example.com", name: "Receiver Name" }],
      subject: "Test Subject UTF-8 ✨",
      text: "Plain text version",
      html: "<h1>HTML version</h1>",
      replyTo: "support@example.com",
      headers: { "X-Custom-Tracking": "track_123" }
    };

    const mime = buildMimePayload(payload);
    expect(mime).toContain("From: \"Sender Team\" <sender@example.com>");
    expect(mime).toContain("To: \"Receiver Name\" <receiver@example.com>");
    expect(mime).toContain("Reply-To: support@example.com");
    expect(mime).toContain("X-Custom-Tracking: track_123");
    expect(mime).toContain("Content-Type: multipart/alternative");
    expect(mime).toContain("Plain text version");
    expect(mime).toContain("<h1>HTML version</h1>");
  });

  it("communicates via genuine SMTP protocol over TCP socket", async () => {
    const commandsReceived: string[] = [];
    let dataPayload = "";
    let isInData = false;

    // Spin up an in-process local SMTP server
    const server = net.createServer((socket) => {
      socket.setEncoding("utf8");
      socket.write("220 test-smtp.local ESMTP MockServer\r\n");

      socket.on("data", (chunk: string) => {
        if (isInData) {
          dataPayload += chunk;
          if (dataPayload.includes("\r\n.\r\n")) {
            isInData = false;
            socket.write("250 2.0.0 Ok: queued as queue_abc_123\r\n");
          }
          return;
        }

        const lines = chunk.split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          commandsReceived.push(line);
          const upper = line.toUpperCase();

          if (upper.startsWith("EHLO") || upper.startsWith("HELO")) {
            socket.write("250-test-smtp.local\r\n250-8BITMIME\r\n250 OK\r\n");
          } else if (upper.startsWith("MAIL FROM:")) {
            socket.write("250 2.1.0 Sender ok\r\n");
          } else if (upper.startsWith("RCPT TO:")) {
            socket.write("250 2.1.5 Recipient ok\r\n");
          } else if (upper === "DATA") {
            isInData = true;
            socket.write("354 Start mail input; end with <CRLF>.<CRLF>\r\n");
          } else if (upper === "QUIT") {
            socket.write("221 2.0.0 Bye\r\n");
            socket.end();
          } else {
            socket.write("250 OK\r\n");
          }
        }
      });
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const port = (server.address() as net.AddressInfo).port;

    try {
      const driver = new SmtpDriver({
        host: "127.0.0.1",
        port,
        encryption: "none"
      });

      const sendResult = await driver.send({
        from: { email: "dispatcher@launchlive.com", name: "LaunchLive Dispatcher" },
        to: [{ email: "client@acme.org" }],
        subject: "Order #4092 Shipped",
        text: "Your order has shipped successfully.",
        html: "<p>Your order has shipped successfully.</p>"
      });

      expect(sendResult.status).toBe("sent");
      expect(sendResult.provider).toBe("smtp");
      expect(sendResult.messageId).toContain("queue_abc_123");

      // Verify exact SMTP protocol sequence was executed
      expect(commandsReceived.some((c) => c.startsWith("EHLO"))).toBe(true);
      expect(commandsReceived.some((c) => c.includes("MAIL FROM:<dispatcher@launchlive.com>"))).toBe(true);
      expect(commandsReceived.some((c) => c.includes("RCPT TO:<client@acme.org>"))).toBe(true);
      expect(commandsReceived.includes("DATA")).toBe(true);
      expect(dataPayload).toContain("Your order has shipped successfully.");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("verifies credentials via EHLO and QUIT handshake", async () => {
    const server = net.createServer((socket) => {
      socket.setEncoding("utf8");
      socket.write("220 smtp-pulse.com ESMTP\r\n");
      socket.on("data", (chunk: string) => {
        if (chunk.toUpperCase().startsWith("EHLO")) {
          socket.write("250 OK\r\n");
        } else if (chunk.toUpperCase().startsWith("QUIT")) {
          socket.write("221 Bye\r\n");
          socket.end();
        }
      });
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const port = (server.address() as net.AddressInfo).port;

    try {
      const driver = new SmtpDriver({
        host: "127.0.0.1",
        port,
        encryption: "none"
      });

      const isVerified = await driver.verifyCredentials();
      expect(isVerified).toBe(true);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
