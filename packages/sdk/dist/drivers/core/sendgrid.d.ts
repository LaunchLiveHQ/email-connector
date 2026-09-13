import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class SendGridDriver implements EmailDriver {
    readonly id = "sendgrid";
    readonly name = "Twilio SendGrid";
    readonly defaultDailyCap = 100;
    private apiKey;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=sendgrid.d.ts.map