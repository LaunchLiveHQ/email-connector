import { describe, it, expect } from "vitest";
import { SendPulseDriver } from "../src/drivers/enterprise/sendpulse.js";

describe("SendPulseDriver", () => {
  it("authenticates via OAuth 2.0 and dispatches to SendPulse SMTP REST API", async () => {
    let tokenExchangeCalled = false;
    let emailEndpointCalled = false;
    let capturedBody: any = null;

    global.fetch = async (url: any, init?: any) => {
      const urlStr = url.toString();

      if (urlStr.includes("/oauth/access_token")) {
        tokenExchangeCalled = true;
        const reqBody = JSON.parse(init.body);
        expect(reqBody.client_id).toBe("sp_client_123");
        expect(reqBody.client_secret).toBe("sp_secret_456");

        return new Response(
          JSON.stringify({
            access_token: "sp_access_token_xyz",
            token_type: "Bearer",
            expires_in: 3600
          }),
          { status: 200 }
        );
      }

      if (urlStr.includes("/smtp/emails")) {
        emailEndpointCalled = true;
        expect(init.headers.Authorization).toBe("Bearer sp_access_token_xyz");
        capturedBody = JSON.parse(init.body);

        return new Response(
          JSON.stringify({
            result: true,
            id: "sp_msg_789"
          }),
          { status: 200 }
        );
      }

      return new Response("Not found", { status: 404 });
    };

    const driver = new SendPulseDriver({
      clientId: "sp_client_123",
      clientSecret: "sp_secret_456"
    });

    const res = await driver.send({
      from: { email: "orders@store.com", name: "Store Notifications" },
      to: [{ email: "customer@gmail.com", name: "Customer" }],
      subject: "Your Invoice #8812",
      html: "<p>Invoice total: $49.00</p>",
      text: "Invoice total: $49.00"
    });

    expect(tokenExchangeCalled).toBe(true);
    expect(emailEndpointCalled).toBe(true);
    expect(res.status).toBe("sent");
    expect(res.messageId).toBe("sp_msg_789");
    expect(res.provider).toBe("sendpulse");

    // Verify SendPulse Base64 HTML encoding requirement
    expect(capturedBody.email.html).toBe(Buffer.from("<p>Invoice total: $49.00</p>").toString("base64"));
    expect(capturedBody.email.from.email).toBe("orders@store.com");
    expect(capturedBody.email.to[0].email).toBe("customer@gmail.com");
  });

  it("works with static API Key Bearer token without needing OAuth token exchange", async () => {
    let emailEndpointCalled = false;

    global.fetch = async (url: any, init?: any) => {
      const urlStr = url.toString();
      if (urlStr.includes("/smtp/emails")) {
        emailEndpointCalled = true;
        expect(init.headers.Authorization).toBe("Bearer static_api_key_777");
        return new Response(JSON.stringify({ result: true, id: "sp_static_ok" }), { status: 200 });
      }
      return new Response("Not found", { status: 404 });
    };

    const driver = new SendPulseDriver({
      apiKey: "static_api_key_777"
    });

    const res = await driver.send({
      from: { email: "alerts@mybrand.com" },
      to: [{ email: "dev@mybrand.com" }],
      subject: "Critical Health Alert",
      text: "System healthy."
    });

    expect(emailEndpointCalled).toBe(true);
    expect(res.messageId).toBe("sp_static_ok");
  });
});
