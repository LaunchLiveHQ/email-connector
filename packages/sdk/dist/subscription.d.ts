import { SubscriptionVerificationResponse, DriverType } from "@emailconnector/config-schema";
export interface SubscriptionVerifierOptions {
    subscriptionId?: string;
    apiBaseUrl?: string;
}
export declare class SubscriptionVerifier {
    private subscriptionId?;
    private apiBaseUrl;
    private cachedResponse?;
    private cacheExpiresAt;
    constructor(options?: SubscriptionVerifierOptions);
    setSubscriptionId(id: string): void;
    verify(): Promise<SubscriptionVerificationResponse>;
    isDriverAllowed(driver: DriverType): Promise<boolean>;
}
//# sourceMappingURL=subscription.d.ts.map