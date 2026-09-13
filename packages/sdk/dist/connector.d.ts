import { StorageAdapter } from "./storage/index.js";
import { SubscriptionVerifier } from "./subscription.js";
import { CartRecoveryAutomation } from "./automations/cart-recovery.js";
import { SendingServer, UnifiedEmailPayload, SendResult } from "@emailconnector/config-schema";
export interface EmailConnectorConfig {
    servers?: SendingServer[];
    subscriptionId?: string;
    storage?: StorageAdapter;
    timeoutMs?: number;
    apiBaseUrl?: string;
}
export declare class EmailConnector {
    private balancer;
    private storage;
    private servers;
    subscription: SubscriptionVerifier;
    cartRecovery: CartRecoveryAutomation;
    constructor(config?: EmailConnectorConfig);
    /**
     * Dispatches an email using Zero-Trust in-process load balancing & priority cascading
     */
    send(payload: UnifiedEmailPayload): Promise<SendResult>;
    /**
     * Adds or registers a sending server at runtime
     */
    addServer(server: SendingServer): Promise<void>;
    /**
     * Returns live quota counters across configured providers
     */
    getQuotaStatus(): Promise<{
        serverId: string;
        provider: string;
        used: number;
        limit: number;
        remaining: number;
    }[]>;
}
/**
 * Factory helper for initializing EmailConnector
 */
export declare function createEmailConnector(config?: EmailConnectorConfig): EmailConnector;
//# sourceMappingURL=connector.d.ts.map