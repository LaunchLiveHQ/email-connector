import { StorageAdapter } from "./storage/index.js";
import { EmailDriver } from "./drivers/index.js";
import { SendingServer, UnifiedEmailPayload, SendResult } from "@emailconnector/config-schema";
export interface ManagedServerItem {
    id: string;
    driver: EmailDriver;
    priority: number;
    dailyLimit: number;
    isActive: boolean;
}
export interface BalancerOptions {
    servers: SendingServer[];
    storage?: StorageAdapter;
    timeoutMs?: number;
}
export declare class ZeroTrustBalancer {
    private servers;
    private storage;
    private timeoutMs;
    constructor(options: BalancerOptions);
    sendEmail(payload: UnifiedEmailPayload): Promise<SendResult>;
    send(payload: UnifiedEmailPayload): Promise<SendResult>;
    getQuotaStatus(): Promise<Array<{
        serverId: string;
        provider: string;
        used: number;
        limit: number;
        remaining: number;
    }>>;
}
//# sourceMappingURL=balancer.d.ts.map