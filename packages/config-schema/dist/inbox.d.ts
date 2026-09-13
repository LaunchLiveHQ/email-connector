import { z } from "zod";
export declare const InboxProviderEnum: z.ZodEnum<["gmail", "outlook", "cloudflare", "imap", "pop3", "webhook"]>;
export type InboxProvider = z.infer<typeof InboxProviderEnum>;
export declare const InboxCapabilitiesSchema: z.ZodObject<{
    receive: z.ZodDefault<z.ZodBoolean>;
    send: z.ZodDefault<z.ZodBoolean>;
    threads: z.ZodDefault<z.ZodBoolean>;
    attachments: z.ZodDefault<z.ZodBoolean>;
    webhooks: z.ZodDefault<z.ZodBoolean>;
    realtime: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    attachments: boolean;
    receive: boolean;
    send: boolean;
    threads: boolean;
    webhooks: boolean;
    realtime: boolean;
}, {
    attachments?: boolean | undefined;
    receive?: boolean | undefined;
    send?: boolean | undefined;
    threads?: boolean | undefined;
    webhooks?: boolean | undefined;
    realtime?: boolean | undefined;
}>;
export type InboxCapabilities = z.infer<typeof InboxCapabilitiesSchema>;
export declare const InboxConnectionSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    provider: z.ZodEnum<["gmail", "outlook", "cloudflare", "imap", "pop3", "webhook"]>;
    name: z.ZodString;
    address: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "error", "syncing"]>>;
    credentialsEncrypted: z.ZodOptional<z.ZodString>;
    oauthConfig: z.ZodOptional<z.ZodObject<{
        accessToken: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNumber>;
        scope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        expiresAt?: number | undefined;
        scope?: string[] | undefined;
    }, {
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        expiresAt?: number | undefined;
        scope?: string[] | undefined;
    }>>;
    capabilities: z.ZodDefault<z.ZodObject<{
        receive: z.ZodDefault<z.ZodBoolean>;
        send: z.ZodDefault<z.ZodBoolean>;
        threads: z.ZodDefault<z.ZodBoolean>;
        attachments: z.ZodDefault<z.ZodBoolean>;
        webhooks: z.ZodDefault<z.ZodBoolean>;
        realtime: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        attachments: boolean;
        receive: boolean;
        send: boolean;
        threads: boolean;
        webhooks: boolean;
        realtime: boolean;
    }, {
        attachments?: boolean | undefined;
        receive?: boolean | undefined;
        send?: boolean | undefined;
        threads?: boolean | undefined;
        webhooks?: boolean | undefined;
        realtime?: boolean | undefined;
    }>>;
    lastSyncedAt: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodDefault<z.ZodNumber>;
    updatedAt: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status: "error" | "active" | "syncing";
    provider: "gmail" | "outlook" | "cloudflare" | "imap" | "pop3" | "webhook";
    id: string;
    createdAt: number;
    updatedAt: number;
    userId: string;
    address: string;
    capabilities: {
        attachments: boolean;
        receive: boolean;
        send: boolean;
        threads: boolean;
        webhooks: boolean;
        realtime: boolean;
    };
    credentialsEncrypted?: string | undefined;
    oauthConfig?: {
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        expiresAt?: number | undefined;
        scope?: string[] | undefined;
    } | undefined;
    lastSyncedAt?: number | undefined;
}, {
    name: string;
    provider: "gmail" | "outlook" | "cloudflare" | "imap" | "pop3" | "webhook";
    id: string;
    userId: string;
    address: string;
    status?: "error" | "active" | "syncing" | undefined;
    createdAt?: number | undefined;
    updatedAt?: number | undefined;
    credentialsEncrypted?: string | undefined;
    oauthConfig?: {
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        expiresAt?: number | undefined;
        scope?: string[] | undefined;
    } | undefined;
    capabilities?: {
        attachments?: boolean | undefined;
        receive?: boolean | undefined;
        send?: boolean | undefined;
        threads?: boolean | undefined;
        webhooks?: boolean | undefined;
        realtime?: boolean | undefined;
    } | undefined;
    lastSyncedAt?: number | undefined;
}>;
export type InboxConnection = z.infer<typeof InboxConnectionSchema>;
export declare const EmailAddressSchema: z.ZodObject<{
    address: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    address: string;
    name?: string | undefined;
}, {
    address: string;
    name?: string | undefined;
}>;
export type EmailAddress = z.infer<typeof EmailAddressSchema>;
export declare const AttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    contentType: z.ZodString;
    size: z.ZodNumber;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filename: string;
    contentType: string;
    id: string;
    size: number;
    url?: string | undefined;
}, {
    filename: string;
    contentType: string;
    id: string;
    size: number;
    url?: string | undefined;
}>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export declare const NormalizedParsedSchema: z.ZodObject<{
    cleanText: z.ZodOptional<z.ZodString>;
    otpCode: z.ZodOptional<z.ZodString>;
    magicLinks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    magicLinks: string[];
    cleanText?: string | undefined;
    otpCode?: string | undefined;
}, {
    cleanText?: string | undefined;
    otpCode?: string | undefined;
    magicLinks?: string[] | undefined;
}>;
export type NormalizedParsed = z.infer<typeof NormalizedParsedSchema>;
export declare const InboxMessageSchema: z.ZodObject<{
    id: z.ZodString;
    connectionId: z.ZodString;
    userId: z.ZodString;
    messageId: z.ZodOptional<z.ZodString>;
    threadId: z.ZodOptional<z.ZodString>;
    from: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        name?: string | undefined;
    }, {
        address: string;
        name?: string | undefined;
    }>, "many">;
    to: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        name?: string | undefined;
    }, {
        address: string;
        name?: string | undefined;
    }>, "many">;
    cc: z.ZodDefault<z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        name?: string | undefined;
    }, {
        address: string;
        name?: string | undefined;
    }>, "many">>;
    subject: z.ZodDefault<z.ZodString>;
    receivedAt: z.ZodDefault<z.ZodNumber>;
    text: z.ZodOptional<z.ZodString>;
    html: z.ZodOptional<z.ZodString>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        filename: z.ZodString;
        contentType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        contentType: string;
        id: string;
        size: number;
        url?: string | undefined;
    }, {
        filename: string;
        contentType: string;
        id: string;
        size: number;
        url?: string | undefined;
    }>, "many">>;
    parsed: z.ZodDefault<z.ZodObject<{
        cleanText: z.ZodOptional<z.ZodString>;
        otpCode: z.ZodOptional<z.ZodString>;
        magicLinks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        magicLinks: string[];
        cleanText?: string | undefined;
        otpCode?: string | undefined;
    }, {
        cleanText?: string | undefined;
        otpCode?: string | undefined;
        magicLinks?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    to: {
        address: string;
        name?: string | undefined;
    }[];
    from: {
        address: string;
        name?: string | undefined;
    }[];
    subject: string;
    attachments: {
        filename: string;
        contentType: string;
        id: string;
        size: number;
        url?: string | undefined;
    }[];
    id: string;
    userId: string;
    connectionId: string;
    cc: {
        address: string;
        name?: string | undefined;
    }[];
    receivedAt: number;
    parsed: {
        magicLinks: string[];
        cleanText?: string | undefined;
        otpCode?: string | undefined;
    };
    html?: string | undefined;
    text?: string | undefined;
    messageId?: string | undefined;
    threadId?: string | undefined;
}, {
    to: {
        address: string;
        name?: string | undefined;
    }[];
    from: {
        address: string;
        name?: string | undefined;
    }[];
    id: string;
    userId: string;
    connectionId: string;
    subject?: string | undefined;
    html?: string | undefined;
    text?: string | undefined;
    attachments?: {
        filename: string;
        contentType: string;
        id: string;
        size: number;
        url?: string | undefined;
    }[] | undefined;
    messageId?: string | undefined;
    threadId?: string | undefined;
    cc?: {
        address: string;
        name?: string | undefined;
    }[] | undefined;
    receivedAt?: number | undefined;
    parsed?: {
        cleanText?: string | undefined;
        otpCode?: string | undefined;
        magicLinks?: string[] | undefined;
    } | undefined;
}>;
export type InboxMessage = z.infer<typeof InboxMessageSchema>;
//# sourceMappingURL=inbox.d.ts.map