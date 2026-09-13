import { z } from "zod";

export const EmailRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
});
export type EmailRecipient = z.infer<typeof EmailRecipientSchema>;

export const EmailSenderSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
});
export type EmailSender = z.infer<typeof EmailSenderSchema>;

export const EmailAttachmentSchema = z.object({
  filename: z.string(),
  content: z.union([z.string(), z.any()]), // Base64 or Buffer
  contentType: z.string()
});
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;

export const UnifiedEmailPayloadSchema = z.object({
  to: z.array(EmailRecipientSchema).min(1),
  from: EmailSenderSchema,
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  headers: z.record(z.string()).optional(),
  attachments: z.array(EmailAttachmentSchema).optional(),
  tags: z.record(z.string()).optional()
});
export type UnifiedEmailPayload = z.infer<typeof UnifiedEmailPayloadSchema>;

export const DispatchAttemptSchema = z.object({
  provider: z.string(),
  status: z.enum(["success", "failed"]),
  statusCode: z.number().optional(),
  error: z.string().optional(),
  durationMs: z.number().optional()
});
export type DispatchAttempt = z.infer<typeof DispatchAttemptSchema>;

export const SendResultSchema = z.object({
  status: z.enum(["sent", "queued", "failed"]),
  messageId: z.string().optional(),
  provider: z.string(),
  latencyMs: z.number(),
  attempts: z.array(DispatchAttemptSchema).default([])
});
export type SendResult = z.infer<typeof SendResultSchema>;
