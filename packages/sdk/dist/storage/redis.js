export class RedisStorageAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async get(key) {
        const raw = await this.client.get(key);
        if (raw === null || raw === undefined)
            return null;
        const num = parseInt(raw, 10);
        return isNaN(num) ? null : num;
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value.toString(), "EX", ttlSeconds);
        }
        else {
            await this.client.set(key, value.toString());
        }
    }
    async incr(key) {
        return await this.client.incr(key);
    }
    async reset(key) {
        await this.client.del(key);
    }
}
//# sourceMappingURL=redis.js.map