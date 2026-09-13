import { z } from "zod";

export const InboxProviderEnum = z.enum([
  "gmail",
  "outlook",
  "cloudflare",
  "imap",
  "pop3",
  "webhook"
]);
export type InboxProvider = z.infer<typeof InboxProviderEnum>;

export const InboxCapabilitiesSchema = z.object({
  receive: z.boolean().default(true),
  send: z.boolean().default(false),
  threads: z.boolean().default(true),
  attachments: z.boolean().default(true),
  webhooks: z.boolean().default(true),
  realtime: z.boolean().default(false)
});
export type InboxCapabilities = z.infer<typeof InboxCapabilitiesSchema>;

export const InboxConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: InboxProviderEnum,
  name: z.string().min(1),
  address: z.string().email(),
  status: z.enum(["active", "error", "syncing"]).default("active"),
  credentialsEncrypted: z.string().optional(), // AES-256-GCM encrypted string
  oauthConfig: z.object({
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    expiresAt: z.number().optional(),
    scope: z.array(z.string()).optional()
  }).optional(),
  capabilities: InboxCapabilitiesSchema.default({
    receive: true,
    send: false,
    threads: true,
    attachments: true,
    webhooks: true,
    realtime: false
  }),
  lastSyncedAt: z.number().optional(),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now())
});
export type InboxConnection = z.infer<typeof InboxConnectionSchema>;

export const EmailAddressSchema = z.object({
  address: z.string(),
  name: z.string().optional()
});
export type EmailAddress = z.infer<typeof EmailAddressSchema>;

export const AttachmentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  contentType: z.string(),
  size: z.number(),
  url: z.string().optional()
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const NormalizedParsedSchema = z.object({
  cleanText: z.string().optional(),     // Reply-quotes and signatures stripped
  otpCode: z.string().optional(),       // Extracted 4-8 digit verification code
  magicLinks: z.array(z.string().url()).default([]) // Extracted authentication/login URLs
});
export type NormalizedParsed = z.infer<typeof NormalizedParsedSchema>;

export const InboxMessageSchema = z.object({
  id: z.string(),
  connectionId: z.string(),
  userId: z.string(),
  messageId: z.string().optional(),
  threadId: z.string().optional(),
  from: z.array(EmailAddressSchema),
  to: z.array(EmailAddressSchema),
  cc: z.array(EmailAddressSchema).default([]),
  subject: z.string().default("(no subject)"),
  receivedAt: z.number().default(() => Date.now()),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(AttachmentSchema).default([]),
  parsed: NormalizedParsedSchema.default({ magicLinks: [] })
});
export type InboxMessage = z.infer<typeof InboxMessageSchema>;
