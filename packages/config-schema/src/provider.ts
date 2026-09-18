import { z } from "zod";

export const SponsorshipTierEnum = z.enum([
  "free_listing",      // Community directory listing
  "verified",          // Verified badge, custom profile, docs backlink ($19/mo)
  "featured",          // Category spotlight, highlighted badge, homepage placement ($79/mo)
  "category_takeover"  // Sticky #1 slot, sponsored comparison injection ($299/mo)
]);
export type SponsorshipTier = z.infer<typeof SponsorshipTierEnum>;

export const ProviderTypeEnum = z.enum([
  "email_api",
  "smtp_relay",
  "transactional",
  "marketing",
  "both_transactional_marketing",
  "newsletter_platform",
  "ecommerce_email",
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

export const PricingTierSchema = z.object({
  name: z.string(),
  priceUsd: z.number(),
  period: z.enum(["monthly", "annual"]).default("monthly"),
  allowance: z.number(), // monthly email allowance
  unitOverageUsd: z.number().optional(), // per 1k emails overage
  highlighted: z.boolean().default(false),
  features: z.array(z.string()).default([])
});
export type PricingTier = z.infer<typeof PricingTierSchema>;

export const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string()
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

export const PromotionPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priceUsd: z.number(),
  durationDays: z.number(),
  priorityLevel: z.number(), // 1 = boost, 2 = spotlight, 3 = takeover
  badgeText: z.string().default("⚡ Promoted"),
  accentColor: z.string().default("amber"),
  isEnabled: z.boolean().default(true)
});
export type PromotionPackage = z.infer<typeof PromotionPackageSchema>;

export const ProviderListingSchema = z.object({
  id: z.string().uuid().or(z.string()),
  slug: z.string().min(2), // e.g. "resend", "brevo", "mailjet", "sendgrid"
  name: z.string().min(2),
  type: ProviderTypeEnum,
  logoUrl: z.string(),
  screenshotUrl: z.string().optional(), // 16:9 Dashboard screenshot
  shortDescription: z.string().max(200),
  longDescriptionMarkdown: z.string(),
  overviewMarkdown: z.string().optional(), // Rich in-depth 800+ word technical guide
  pricingModel: PricingModelEnum,
  freeTierAllowance: z.number().default(0), // Monthly free allowance
  dailyFreeCap: z.number().default(0),      // Daily limit cap
  startingPriceUsd: z.number().default(0),
  websiteUrl: z.string().url(),
  affiliateUrl: z.string().url().optional(), // Tracked redirect URL
  isDriverSupportedInSdk: z.boolean().default(false),
  isPaidTierDriver: z.boolean().default(false).optional(), // Needs subscription ID unlock
  supportsTransactional: z.boolean().default(true).optional(),
  supportsMarketing: z.boolean().default(false).optional(),
  supportsNewsletter: z.boolean().default(false).optional(),
  sponsorshipTier: SponsorshipTierEnum.default("free_listing"),
  sponsorshipBilling: z.enum(["monthly", "quarterly", "annual", "one_off"]).optional(),
  sponsorshipExpiresAt: z.string().optional(),
  sponsoredUntil: z.string().optional(),
  promotionPriority: z.number().default(0).optional(), // 0 = standard, 1 = boost, 2 = spotlight, 3 = takeover
  promotedUntil: z.string().optional(),
  promotedPackageId: z.string().optional(),
  exclusiveDiscountCode: z.string().optional(), // e.g. "EMAILCONNECTOR20"
  exclusiveDiscountDescription: z.string().optional(), // e.g. "20% off all paid plans for 6 months"
  exclusiveOfferExpiresAt: z.string().optional(),
  ratingsAverage: z.number().min(0).max(5).default(5.0),
  ratingsCount: z.number().default(1),
  docsIntegrationSlug: z.string().optional(), // e.g. "resend" -> /integrations/resend-with-nextjs
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  apiLatencyAvgMs: z.number().default(120),
  requiresCreditCard: z.boolean().default(false).optional(),
  features: z.array(ProviderFeatureSchema).default([]).optional(),
  pricingTiers: z.array(PricingTierSchema).default([]).optional(),
  faqs: z.array(FaqItemSchema).default([]).optional(),
  tags: z.array(z.string()).default([]).optional(),
  alternativeSlugs: z.array(z.string()).default([]).optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    docs: z.string().optional(),
    discord: z.string().optional(),
    linkedin: z.string().optional()
  }).optional(),
  status: z.enum(["approved", "pending", "rejected"]).default("approved").optional(),
  lastUpdated: z.string().default("2026-09-18").optional()
});
export type ProviderListing = z.infer<typeof ProviderListingSchema>;
