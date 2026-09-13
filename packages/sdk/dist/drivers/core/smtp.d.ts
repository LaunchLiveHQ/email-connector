import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class SmtpDriver implements EmailDriver {
    readonly id = "smtp";
    readonly name = "Custom SMTP Relay / Mailpit";
    readonly defaultDailyCap = 999999;
    private host;
    private port;
    private user?;
    private password?;
    private encryption;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=smtp.d.ts.map