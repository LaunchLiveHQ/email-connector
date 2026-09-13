import { z } from "zod";
export declare const SponsorshipTierEnum: z.ZodEnum<["free_listing", "verified", "featured", "category_takeover"]>;
export type SponsorshipTier = z.infer<typeof SponsorshipTierEnum>;
export declare const ProviderTypeEnum: z.ZodEnum<["email_api", "smtp_relay", "webhook_gateway", "cold_email", "notification_infra"]>;
export type ProviderType = z.infer<typeof ProviderTypeEnum>;
export declare const PricingModelEnum: z.ZodEnum<["free_tier_available", "freemium", "paid_only"]>;
export type PricingModel = z.infer<typeof PricingModelEnum>;
export declare const ProviderFeatureSchema: z.ZodObject<{
    name: z.ZodString;
    supported: z.ZodBoolean;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    supported: boolean;
    description?: string | undefined;
}, {
    name: string;
    supported: boolean;
    description?: string | undefined;
}>;
export type ProviderFeature = z.infer<typeof ProviderFeatureSchema>;
export declare const ProviderListingSchema: z.ZodObject<{
    id: z.ZodUnion<[z.ZodString, z.ZodString]>;
    slug: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["email_api", "smtp_relay", "webhook_gateway", "cold_email", "notification_infra"]>;
    logoUrl: z.ZodString;
    shortDescription: z.ZodString;
    longDescriptionMarkdown: z.ZodString;
    pricingModel: z.ZodEnum<["free_tier_available", "freemium", "paid_only"]>;
    freeTierAllowance: z.ZodDefault<z.ZodNumber>;
    dailyFreeCap: z.ZodDefault<z.ZodNumber>;
    startingPriceUsd: z.ZodDefault<z.ZodNumber>;
    websiteUrl: z.ZodString;
    affiliateUrl: z.ZodOptional<z.ZodString>;
    isDriverSupportedInSdk: z.ZodDefault<z.ZodBoolean>;
    isPaidTierDriver: z.ZodDefault<z.ZodBoolean>;
    sponsorshipTier: z.ZodDefault<z.ZodEnum<["free_listing", "verified", "featured", "category_takeover"]>>;
    sponsoredUntil: z.ZodOptional<z.ZodString>;
    ratingsAverage: z.ZodDefault<z.ZodNumber>;
    ratingsCount: z.ZodDefault<z.ZodNumber>;
    docsIntegrationSlug: z.ZodOptional<z.ZodString>;
    pros: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    cons: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    apiLatencyAvgMs: z.ZodDefault<z.ZodNumber>;
    features: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        supported: z.ZodBoolean;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        supported: boolean;
        description?: string | undefined;
    }, {
        name: string;
        supported: boolean;
        description?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "email_api" | "smtp_relay" | "webhook_gateway" | "cold_email" | "notification_infra";
    id: string;
    slug: string;
    logoUrl: string;
    shortDescription: string;
    longDescriptionMarkdown: string;
    pricingModel: "free_tier_available" | "freemium" | "paid_only";
    freeTierAllowance: number;
    dailyFreeCap: number;
    startingPriceUsd: number;
    websiteUrl: string;
    isDriverSupportedInSdk: boolean;
    isPaidTierDriver: boolean;
    sponsorshipTier: "free_listing" | "verified" | "featured" | "category_takeover";
    ratingsAverage: number;
    ratingsCount: number;
    pros: string[];
    cons: string[];
    apiLatencyAvgMs: number;
    features: {
        name: string;
        supported: boolean;
        description?: string | undefined;
    }[];
    affiliateUrl?: string | undefined;
    sponsoredUntil?: string | undefined;
    docsIntegrationSlug?: string | undefined;
}, {
    name: string;
    type: "email_api" | "smtp_relay" | "webhook_gateway" | "cold_email" | "notification_infra";
    id: string;
    slug: string;
    logoUrl: string;
    shortDescription: string;
    longDescriptionMarkdown: string;
    pricingModel: "free_tier_available" | "freemium" | "paid_only";
    websiteUrl: string;
    freeTierAllowance?: number | undefined;
    dailyFreeCap?: number | undefined;
    startingPriceUsd?: number | undefined;
    affiliateUrl?: string | undefined;
    isDriverSupportedInSdk?: boolean | undefined;
    isPaidTierDriver?: boolean | undefined;
    sponsorshipTier?: "free_listing" | "verified" | "featured" | "category_takeover" | undefined;
    sponsoredUntil?: string | undefined;
    ratingsAverage?: number | undefined;
    ratingsCount?: number | undefined;
    docsIntegrationSlug?: string | undefined;
    pros?: string[] | undefined;
    cons?: string[] | undefined;
    apiLatencyAvgMs?: number | undefined;
    features?: {
        name: string;
        supported: boolean;
        description?: string | undefined;
    }[] | undefined;
}>;
export type ProviderListing = z.infer<typeof ProviderListingSchema>;
//# sourceMappingURL=provider.d.ts.map