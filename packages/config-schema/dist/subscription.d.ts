import { z } from "zod";
export declare const SubscriptionTierEnum: z.ZodEnum<["free", "pro", "enterprise"]>;
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;
export declare const SubscriptionStatusEnum: z.ZodEnum<["active", "cancelled", "expired", "trial"]>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;
export declare const SubscriptionVerificationRequestSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subscriptionId: string;
    apiKey?: string | undefined;
}, {
    subscriptionId: string;
    apiKey?: string | undefined;
}>;
export type SubscriptionVerificationRequest = z.infer<typeof SubscriptionVerificationRequestSchema>;
export declare const SubscriptionVerificationResponseSchema: z.ZodObject<{
    isValid: z.ZodBoolean;
    tier: z.ZodEnum<["free", "pro", "enterprise"]>;
    status: z.ZodEnum<["active", "cancelled", "expired", "trial"]>;
    allowedDrivers: z.ZodArray<z.ZodEnum<["resend", "brevo", "mailjet", "mailersend", "sendgrid", "smtp", "zeptomail", "postmark", "aws_ses", "mailtrap", "scaleway", "mandrill", "bird", "netcore", "sender", "emailoctopus", "smtp2go", "mailgun", "reloop", "lettr", "jetemail", "primitive", "camelmailer", "agentmail", "sendkit", "inbound", "sequenzy", "knock", "courier"]>, "many">;
    maxMonthlyQuota: z.ZodNumber;
    expiresAt: z.ZodOptional<z.ZodNumber>;
    customerEmail: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "cancelled" | "expired" | "trial";
    isValid: boolean;
    tier: "free" | "pro" | "enterprise";
    allowedDrivers: ("resend" | "brevo" | "mailjet" | "mailersend" | "sendgrid" | "smtp" | "zeptomail" | "postmark" | "aws_ses" | "mailtrap" | "scaleway" | "mandrill" | "bird" | "netcore" | "sender" | "emailoctopus" | "smtp2go" | "mailgun" | "reloop" | "lettr" | "jetemail" | "primitive" | "camelmailer" | "agentmail" | "sendkit" | "inbound" | "sequenzy" | "knock" | "courier")[];
    maxMonthlyQuota: number;
    message?: string | undefined;
    expiresAt?: number | undefined;
    customerEmail?: string | undefined;
}, {
    status: "active" | "cancelled" | "expired" | "trial";
    isValid: boolean;
    tier: "free" | "pro" | "enterprise";
    allowedDrivers: ("resend" | "brevo" | "mailjet" | "mailersend" | "sendgrid" | "smtp" | "zeptomail" | "postmark" | "aws_ses" | "mailtrap" | "scaleway" | "mandrill" | "bird" | "netcore" | "sender" | "emailoctopus" | "smtp2go" | "mailgun" | "reloop" | "lettr" | "jetemail" | "primitive" | "camelmailer" | "agentmail" | "sendkit" | "inbound" | "sequenzy" | "knock" | "courier")[];
    maxMonthlyQuota: number;
    message?: string | undefined;
    expiresAt?: number | undefined;
    customerEmail?: string | undefined;
}>;
export type SubscriptionVerificationResponse = z.infer<typeof SubscriptionVerificationResponseSchema>;
//# sourceMappingURL=subscription.d.ts.map