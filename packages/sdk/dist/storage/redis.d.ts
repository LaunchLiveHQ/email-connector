import { StorageAdapter } from "./adapter.js";
export interface GenericRedisClient {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string | number, ...args: any[]) => Promise<any>;
    incr: (key: string) => Promise<number>;
    del: (key: string) => Promise<number>;
}
export declare class RedisStorageAdapter implements StorageAdapter {
    private client;
    constructor(client: GenericRedisClient);
    get(key: string): Promise<number | null>;
    set(key: string, value: number, ttlSeconds?: number): Promise<void>;
    incr(key: string): Promise<number>;
    reset(key: string): Promise<void>;
}
//# sourceMappingURL=redis.d.ts.map