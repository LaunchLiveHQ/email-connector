import { z } from "zod";

export const CoreDriverTypeEnum = z.enum([
  "resend",
  "brevo",
  "mailjet",
  "mailersend",
  "sendgrid",
  "smtp"
]);
export type CoreDriverType = z.infer<typeof CoreDriverTypeEnum>;

export const EnterpriseDriverTypeEnum = z.enum([
  "zeptomail",
  "postmark",
  "aws_ses",
  "sendpulse",
  "azure",
  "smtp2go",
  "mailgun",
  "mailtrap",
  "scaleway",
  "mandrill",
  "bird",
  "netcore",
  "sender",
  "emailoctopus",
  "reloop",
  "lettr",
  "jetemail",
  "primitive",
  "camelmailer",
  "agentmail",
  "sendkit",
  "inbound",
  "sequenzy",
  "knock",
  "courier",
  "plunk",
  "loops",
  "sparkpost",
  "cloudflare",
  "iterable",
  "lettermint",
  "mailpace",
  "unosend",
  "ahasend",
  "mailchannels"
]);
export type EnterpriseDriverType = z.infer<typeof EnterpriseDriverTypeEnum>;

export const DriverTypeEnum = z.enum([
  // Core Free Tier Providers (24k Free Quota Pool)
  "resend",
  "brevo",
  "mailjet",
  "mailersend",
  "sendgrid",
  "smtp",
  // Enterprise & Modern ESPs (Unlocked via Subscription ID)
  "zeptomail",
  "postmark",
  "aws_ses",
  "sendpulse",
  "azure",
  "smtp2go",
  "mailgun",
  "mailtrap",
  "scaleway",
  "mandrill",
  "bird",
  "netcore",
  "sender",
  "emailoctopus",
  "reloop",
  "lettr",
  "jetemail",
  "primitive",
  "camelmailer",
  "agentmail",
  "sendkit",
  "inbound",
  "sequenzy",
  "knock",
  "courier",
  "plunk",
  "loops",
  "sparkpost",
  "cloudflare",
  "iterable",
  "lettermint",
  "mailpace",
  "unosend",
  "ahasend",
  "mailchannels"
]);
export type DriverType = z.infer<typeof DriverTypeEnum>;

export const SmtpEncryptionEnum = z.enum(["none", "ssl", "tls", "starttls"]);
export type SmtpEncryption = z.infer<typeof SmtpEncryptionEnum>;

export const DriverCredentialsSchema = z.object({
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
  serverToken: z.string().optional(),
  domain: z.string().optional(),
  region: z.string().default("us-east-1").optional(),
  // SMTP specific
  host: z.string().optional(),
  port: z.number().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  encryption: SmtpEncryptionEnum.default("tls").optional(),
  // AWS SES specific
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  // OAuth 2.0 (e.g. SendPulse)
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  // Azure specific
  connectionString: z.string().optional(),
  endpoint: z.string().optional(),
  // SMTP2GO specific
  fastAccept: z.boolean().optional()
});
export type DriverCredentials = z.infer<typeof DriverCredentialsSchema>;

export const SendingServerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  driver: DriverTypeEnum,
  priority: z.number().int().min(1).max(5).default(1), // 1 = Highest, 5 = Lowest
  dailyLimit: z.number().int().positive().default(100),
  dailyUsed: z.number().int().default(0),
  rateLimitPerMin: z.number().int().positive().optional(),
  credentials: DriverCredentialsSchema,
  isActive: z.boolean().default(true),
  isHealthy: z.boolean().default(true),
  lastError: z.string().optional(),
  lastTestedAt: z.number().optional()
});
export type SendingServer = z.infer<typeof SendingServerSchema>;
