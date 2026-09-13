import { StorageAdapter } from "./adapter.js";

export interface GenericRedisClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string | number, ...args: any[]) => Promise<any>;
  incr: (key: string) => Promise<number>;
  del: (key: string) => Promise<number>;
}

export class RedisStorageAdapter implements StorageAdapter {
  private client: GenericRedisClient;

  constructor(client: GenericRedisClient) {
    this.client = client;
  }

  async get(key: string): Promise<number | null> {
    const raw = await this.client.get(key);
    if (raw === null || raw === undefined) return null;
    const num = parseInt(raw, 10);
    return isNaN(num) ? null : num;
  }

  async set(key: string, value: number, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value.toString(), "EX", ttlSeconds);
    } else {
      await this.client.set(key, value.toString());
    }
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async reset(key: string): Promise<void> {
    await this.client.del(key);
  }
}
