import { StorageAdapter } from "./adapter.js";
export declare class MemoryStorageAdapter implements StorageAdapter {
    private store;
    get(key: string): Promise<number | null>;
    set(key: string, value: number, ttlSeconds?: number): Promise<void>;
    incr(key: string): Promise<number>;
    reset(key: string): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map