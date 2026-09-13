import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class MailerSendDriver implements EmailDriver {
    readonly id = "mailersend";
    readonly name = "MailerSend";
    readonly defaultDailyCap = 100;
    private apiKey;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=mailersend.d.ts.map