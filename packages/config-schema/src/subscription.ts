import { z } from "zod";
import { DriverTypeEnum } from "./server.js";

export const SubscriptionTierEnum = z.enum(["free", "pro", "enterprise"]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

export const SubscriptionStatusEnum = z.enum(["active", "cancelled", "expired", "trial"]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const SubscriptionVerificationRequestSchema = z.object({
  subscriptionId: z.string().min(4),
  apiKey: z.string().optional()
});
export type SubscriptionVerificationRequest = z.infer<typeof SubscriptionVerificationRequestSchema>;

export const SubscriptionVerificationResponseSchema = z.object({
  isValid: z.boolean(),
  tier: SubscriptionTierEnum,
  status: SubscriptionStatusEnum,
  allowedDrivers: z.array(DriverTypeEnum),
  maxMonthlyQuota: z.number().int(),
  expiresAt: z.number().optional(),
  customerEmail: z.string().optional(),
  message: z.string().optional()
});
export type SubscriptionVerificationResponse = z.infer<typeof SubscriptionVerificationResponseSchema>;
