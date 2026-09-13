export interface StorageAdapter {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttlSeconds?: number): Promise<void>;
  incr(key: string): Promise<number>;
  reset(key: string): Promise<void>;
}
