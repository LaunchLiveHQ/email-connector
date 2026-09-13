import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class MailjetDriver implements EmailDriver {
    readonly id = "mailjet";
    readonly name = "Mailjet";
    readonly defaultDailyCap = 200;
    private apiKey;
    private secretKey;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=mailjet.d.ts.map