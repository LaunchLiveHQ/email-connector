import { z } from "zod";
export const WebhookProviderEnum = z.enum([
    "standard_webhooks",
    "svix",
    "hookdeck",
    "shopify",
    "stripe",
    "lemon_squeezy",
    "woocommerce",
    "custom"
]);
export const InboundWebhookPayloadSchema = z.object({
    id: z.string(),
    source: WebhookProviderEnum,
    eventType: z.string(),
    timestamp: z.number(),
    data: z.record(z.any()),
    rawBody: z.string().optional(),
    signature: z.string().optional()
});
export const WebhookVerificationConfigSchema = z.object({
    secret: z.string().min(1),
    toleranceSeconds: z.number().default(300) // 5 minutes anti-replay window
});
//# sourceMappingURL=webhook.js.map