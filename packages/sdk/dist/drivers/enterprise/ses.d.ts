import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class AwsSesDriver implements EmailDriver {
    readonly id = "aws_ses";
    readonly name = "AWS SES";
    readonly defaultDailyCap = 50000;
    private accessKeyId?;
    private secretAccessKey?;
    private region;
    constructor(credentials: DriverCredentials);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=ses.d.ts.map