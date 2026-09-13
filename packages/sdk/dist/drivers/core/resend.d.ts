import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class ResendDriver implements EmailDriver {
    readonly id = "resend";
    readonly name = "Resend";
    readonly defaultDailyCap = 100;
    private apiKey;
    private customDomain?;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=resend.d.ts.map