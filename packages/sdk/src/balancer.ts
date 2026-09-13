import { StorageAdapter, MemoryStorageAdapter } from "./storage/index.js";
import { EmailDriver, createDriverFromServer } from "./drivers/index.js";
import {
  SendingServer,
  UnifiedEmailPayload,
  SendResult,
  DispatchAttempt
} from "@emailconnector/config-schema";

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

export class ZeroTrustBalancer {
  private servers: ManagedServerItem[];
  private storage: StorageAdapter;
  private timeoutMs: number;

  constructor(options: BalancerOptions) {
    this.storage = options.storage || new MemoryStorageAdapter();
    this.timeoutMs = options.timeoutMs || 8000; // 8 second timeout per provider

    // Instantiate drivers and sort by priority (1 = highest priority)
    this.servers = (options.servers as any[])
      .filter((s) => s.isActive !== false && s.status !== "inactive")
      .map((s) => ({
        id: s.id,
        driver: createDriverFromServer(s),
        priority: s.priority ?? 1,
        dailyLimit: s.dailyLimit ?? 100,
        isActive: s.isActive !== false && s.status !== "inactive"
      }))
      .sort((a, b) => a.priority - b.priority);
  }

  async sendEmail(payload: UnifiedEmailPayload): Promise<SendResult> {
    return this.send(payload);
  }

  async send(payload: UnifiedEmailPayload): Promise<SendResult> {
    const today = new Date().toISOString().slice(0, 10);
    const attempts: DispatchAttempt[] = [];

    if (this.servers.length === 0) {
      throw new Error("No active sending servers configured in EmailConnector.");
    }

    for (const server of this.servers) {
      const quotaKey = `ec:quota:${server.id}:${today}`;
      const usedToday = (await this.storage.get(quotaKey)) || 0;

      // Skip if daily limit reached
      if (usedToday >= server.dailyLimit) {
        continue;
      }

      const startTime = Date.now();
      try {
        // Execute dispatch with timeout
        const result = await Promise.race([
          server.driver.send(payload),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${this.timeoutMs}ms`)), this.timeoutMs)
          )
        ]);

        // Increment quota counter upon successful dispatch
        await this.storage.incr(quotaKey);

        return {
          status: "sent",
          messageId: result.messageId,
          provider: server.driver.id,
          latencyMs: Date.now() - startTime,
          attempts: [
            ...attempts,
            {
              provider: server.driver.id,
              status: "success",
              statusCode: 200,
              durationMs: Date.now() - startTime
            }
          ]
        };
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        attempts.push({
          provider: server.driver.id,
          status: "failed",
          statusCode: err.statusCode || 500,
          error: err.message || "Unknown error",
          durationMs
        });

        // Automatic cascade to next priority server
        console.warn(
          `[ZeroTrustBalancer] Provider ${server.driver.id} (Priority ${server.priority}) failed: ${err.message}. Cascading...`
        );
      }
    }

    // All active servers failed or reached daily limit
    const errorDetails = attempts.map((a) => `${a.provider}: ${a.error}`).join(" | ");
    throw new Error(
      `All connected email providers daily quotas were exhausted or failed. Attempts: [${errorDetails}]`
    );
  }

  async getQuotaStatus(): Promise<Array<{ serverId: string; provider: string; used: number; limit: number; remaining: number }>> {
    const today = new Date().toISOString().slice(0, 10);
    const results = [];

    for (const s of this.servers) {
      const quotaKey = `ec:quota:${s.id}:${today}`;
      const used = (await this.storage.get(quotaKey)) || 0;
      results.push({
        serverId: s.id,
        provider: s.driver.id,
        used,
        limit: s.dailyLimit,
        remaining: Math.max(0, s.dailyLimit - used)
      });
    }

    return results;
  }
}
