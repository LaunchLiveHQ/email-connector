import { UnifiedEmailPayload, SendResult } from "@emailconnector/config-schema";
export interface RateLimitInfo {
    dailyLimit: number;
    dailyUsed: number;
    perMinuteLimit?: number;
    resetAt: number;
}
export interface EmailDriver {
    readonly id: string;
    readonly name: string;
    readonly defaultDailyCap: number;
    send(message: UnifiedEmailPayload): Promise<SendResult>;
    verifyCredentials(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitInfo>;
}
//# sourceMappingURL=driver.d.ts.map