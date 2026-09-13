import { z } from "zod";
export declare const EmailRecipientSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name?: string | undefined;
}, {
    email: string;
    name?: string | undefined;
}>;
export type EmailRecipient = z.infer<typeof EmailRecipientSchema>;
export declare const EmailSenderSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name?: string | undefined;
}, {
    email: string;
    name?: string | undefined;
}>;
export type EmailSender = z.infer<typeof EmailSenderSchema>;
export declare const EmailAttachmentSchema: z.ZodObject<{
    filename: z.ZodString;
    content: z.ZodUnion<[z.ZodString, z.ZodAny]>;
    contentType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filename: string;
    contentType: string;
    content?: any;
}, {
    filename: string;
    contentType: string;
    content?: any;
}>;
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;
export declare const UnifiedEmailPayloadSchema: z.ZodObject<{
    to: z.ZodArray<z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
    }>, "many">;
    from: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
    }>;
    subject: z.ZodString;
    html: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    replyTo: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodUnion<[z.ZodString, z.ZodAny]>;
        contentType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        contentType: string;
        content?: any;
    }, {
        filename: string;
        contentType: string;
        content?: any;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    to: {
        email: string;
        name?: string | undefined;
    }[];
    from: {
        email: string;
        name?: string | undefined;
    };
    subject: string;
    html?: string | undefined;
    text?: string | undefined;
    replyTo?: string | undefined;
    headers?: Record<string, string> | undefined;
    attachments?: {
        filename: string;
        contentType: string;
        content?: any;
    }[] | undefined;
    tags?: Record<string, string> | undefined;
}, {
    to: {
        email: string;
        name?: string | undefined;
    }[];
    from: {
        email: string;
        name?: string | undefined;
    };
    subject: string;
    html?: string | undefined;
    text?: string | undefined;
    replyTo?: string | undefined;
    headers?: Record<string, string> | undefined;
    attachments?: {
        filename: string;
        contentType: string;
        content?: any;
    }[] | undefined;
    tags?: Record<string, string> | undefined;
}>;
export type UnifiedEmailPayload = z.infer<typeof UnifiedEmailPayloadSchema>;
export declare const DispatchAttemptSchema: z.ZodObject<{
    provider: z.ZodString;
    status: z.ZodEnum<["success", "failed"]>;
    statusCode: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "success" | "failed";
    provider: string;
    statusCode?: number | undefined;
    error?: string | undefined;
    durationMs?: number | undefined;
}, {
    status: "success" | "failed";
    provider: string;
    statusCode?: number | undefined;
    error?: string | undefined;
    durationMs?: number | undefined;
}>;
export type DispatchAttempt = z.infer<typeof DispatchAttemptSchema>;
export declare const SendResultSchema: z.ZodObject<{
    status: z.ZodEnum<["sent", "queued", "failed"]>;
    messageId: z.ZodOptional<z.ZodString>;
    provider: z.ZodString;
    latencyMs: z.ZodNumber;
    attempts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        status: z.ZodEnum<["success", "failed"]>;
        statusCode: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodString>;
        durationMs: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status: "success" | "failed";
        provider: string;
        statusCode?: number | undefined;
        error?: string | undefined;
        durationMs?: number | undefined;
    }, {
        status: "success" | "failed";
        provider: string;
        statusCode?: number | undefined;
        error?: string | undefined;
        durationMs?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "sent" | "queued";
    provider: string;
    latencyMs: number;
    attempts: {
        status: "success" | "failed";
        provider: string;
        statusCode?: number | undefined;
        error?: string | undefined;
        durationMs?: number | undefined;
    }[];
    messageId?: string | undefined;
}, {
    status: "failed" | "sent" | "queued";
    provider: string;
    latencyMs: number;
    messageId?: string | undefined;
    attempts?: {
        status: "success" | "failed";
        provider: string;
        statusCode?: number | undefined;
        error?: string | undefined;
        durationMs?: number | undefined;
    }[] | undefined;
}>;
export type SendResult = z.infer<typeof SendResultSchema>;
//# sourceMappingURL=email.d.ts.map