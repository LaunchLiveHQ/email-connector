export class MemoryStorageAdapter {
    store = new Map();
    async get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
    }
    async incr(key) {
        const current = (await this.get(key)) || 0;
        const next = current + 1;
        await this.set(key, next);
        return next;
    }
    async reset(key) {
        this.store.delete(key);
    }
}
//# sourceMappingURL=memory.js.map