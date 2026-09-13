import { z } from "zod";

export const SponsorshipTierEnum = z.enum([
  "free_listing",      // Community directory listing
  "verified",          // Verified badge, custom profile, docs backlink ($49/mo)
  "featured",          // Top of category, highlighted badge, homepage placement ($199/mo)
  "category_takeover"  // Sticky #1 slot, sponsored comparison injection ($499/mo)
]);
export type SponsorshipTier = z.infer<typeof SponsorshipTierEnum>;

export const ProviderTypeEnum = z.enum([
  "email_api",
  "smtp_relay",
  "webhook_gateway",
  "cold_email",
  "notification_infra"
]);
export type ProviderType = z.infer<typeof ProviderTypeEnum>;

export const PricingModelEnum = z.enum([
  "free_tier_available",
  "freemium",
  "paid_only"
]);
export type PricingModel = z.infer<typeof PricingModelEnum>;

export const ProviderFeatureSchema = z.object({
  name: z.string(),
  supported: z.boolean(),
  description: z.string().optional()
});
export type ProviderFeature = z.infer<typeof ProviderFeatureSchema>;

export const ProviderListingSchema = z.object({
  id: z.string().uuid().or(z.string()),
  slug: z.string().min(2), // e.g. "resend", "brevo", "mailjet", "sendgrid"
  name: z.string().min(2),
  type: ProviderTypeEnum,
  logoUrl: z.string(),
  shortDescription: z.string().max(200),
  longDescriptionMarkdown: z.string(),
  pricingModel: PricingModelEnum,
  freeTierAllowance: z.number().default(0), // Monthly free allowance
  dailyFreeCap: z.number().default(0),      // Daily limit cap
  startingPriceUsd: z.number().default(0),
  websiteUrl: z.string().url(),
  affiliateUrl: z.string().url().optional(), // Tracked redirect URL
  isDriverSupportedInSdk: z.boolean().default(false),
  isPaidTierDriver: z.boolean().default(false), // Needs subscription ID unlock
  sponsorshipTier: SponsorshipTierEnum.default("free_listing"),
  sponsoredUntil: z.string().optional(),
  ratingsAverage: z.number().min(0).max(5).default(5.0),
  ratingsCount: z.number().default(1),
  docsIntegrationSlug: z.string().optional(), // e.g. "resend" -> /integrations/resend-with-nextjs
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  apiLatencyAvgMs: z.number().default(120),
  features: z.array(ProviderFeatureSchema).default([])
});
export type ProviderListing = z.infer<typeof ProviderListingSchema>;
