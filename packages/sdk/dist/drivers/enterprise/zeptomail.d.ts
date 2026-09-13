import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class ZeptoMailDriver implements EmailDriver {
    readonly id = "zeptomail";
    readonly name = "ZeptoMail (Zoho)";
    readonly defaultDailyCap = 333;
    private apiKey;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=zeptomail.d.ts.map