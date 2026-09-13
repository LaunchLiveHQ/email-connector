import { z } from "zod";
export declare const WebhookProviderEnum: z.ZodEnum<["standard_webhooks", "svix", "hookdeck", "shopify", "stripe", "lemon_squeezy", "woocommerce", "custom"]>;
export type WebhookProvider = z.infer<typeof WebhookProviderEnum>;
export declare const InboundWebhookPayloadSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodEnum<["standard_webhooks", "svix", "hookdeck", "shopify", "stripe", "lemon_squeezy", "woocommerce", "custom"]>;
    eventType: z.ZodString;
    timestamp: z.ZodNumber;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    rawBody: z.ZodOptional<z.ZodString>;
    signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    source: "custom" | "stripe" | "standard_webhooks" | "svix" | "hookdeck" | "shopify" | "lemon_squeezy" | "woocommerce";
    eventType: string;
    timestamp: number;
    data: Record<string, any>;
    rawBody?: string | undefined;
    signature?: string | undefined;
}, {
    id: string;
    source: "custom" | "stripe" | "standard_webhooks" | "svix" | "hookdeck" | "shopify" | "lemon_squeezy" | "woocommerce";
    eventType: string;
    timestamp: number;
    data: Record<string, any>;
    rawBody?: string | undefined;
    signature?: string | undefined;
}>;
export type InboundWebhookPayload = z.infer<typeof InboundWebhookPayloadSchema>;
export declare const WebhookVerificationConfigSchema: z.ZodObject<{
    secret: z.ZodString;
    toleranceSeconds: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    secret: string;
    toleranceSeconds: number;
}, {
    secret: string;
    toleranceSeconds?: number | undefined;
}>;
export type WebhookVerificationConfig = z.infer<typeof WebhookVerificationConfigSchema>;
//# sourceMappingURL=webhook.d.ts.map