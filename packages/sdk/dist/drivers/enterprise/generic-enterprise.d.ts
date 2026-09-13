import { EmailDriver, RateLimitInfo } from "../driver.js";
import { UnifiedEmailPayload, SendResult, DriverCredentials } from "@emailconnector/config-schema";
export declare class GenericEnterpriseDriver implements EmailDriver {
    readonly id: string;
    readonly name: string;
    readonly defaultDailyCap: number;
    private credentials;
    constructor(id: string, name: string, credentials: DriverCredentials, defaultDailyCap?: number);
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=generic-enterprise.d.ts.map