import { StorageAdapter } from "./adapter.js";

export class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, { value: number; expiresAt?: number }> = new Map();

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: number, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get(key)) || 0;
    const next = current + 1;
    await this.set(key, next);
    return next;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}
