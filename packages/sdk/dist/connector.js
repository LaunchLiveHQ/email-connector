import { ZeroTrustBalancer } from "./balancer.js";
import { MemoryStorageAdapter } from "./storage/index.js";
import { SubscriptionVerifier } from "./subscription.js";
import { CartRecoveryAutomation } from "./automations/cart-recovery.js";
export class EmailConnector {
    balancer;
    storage;
    servers;
    subscription;
    cartRecovery;
    constructor(config = {}) {
        this.storage = config.storage || new MemoryStorageAdapter();
        this.servers = config.servers || [];
        this.balancer = new ZeroTrustBalancer({
            servers: this.servers,
            storage: this.storage,
            timeoutMs: config.timeoutMs
        });
        this.subscription = new SubscriptionVerifier({
            subscriptionId: config.subscriptionId,
            apiBaseUrl: config.apiBaseUrl
        });
        this.cartRecovery = new CartRecoveryAutomation(this.balancer);
    }
    /**
     * Dispatches an email using Zero-Trust in-process load balancing & priority cascading
     */
    async send(payload) {
        return await this.balancer.send(payload);
    }
    /**
     * Adds or registers a sending server at runtime
     */
    async addServer(server) {
        // Verify driver entitlement if enterprise driver
        const isAllowed = await this.subscription.isDriverAllowed(server.driver);
        if (!isAllowed) {
            throw new Error(`Driver '${server.driver}' is an Enterprise ESP and requires an active subscription ID.`);
        }
        this.servers.push(server);
        this.balancer = new ZeroTrustBalancer({
            servers: this.servers,
            storage: this.storage
        });
        this.cartRecovery = new CartRecoveryAutomation(this.balancer);
    }
    /**
     * Returns live quota counters across configured providers
     */
    async getQuotaStatus() {
        return await this.balancer.getQuotaStatus();
    }
}
/**
 * Factory helper for initializing EmailConnector
 */
export function createEmailConnector(config = {}) {
    return new EmailConnector(config);
}
//# sourceMappingURL=connector.js.map