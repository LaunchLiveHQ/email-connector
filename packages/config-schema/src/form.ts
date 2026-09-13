import { z } from "zod";

export const FormFieldTypeEnum = z.enum([
  "open_text",
  "multiple_choice_single",
  "multiple_choice_multi",
  "rating",
  "nps",
  "email",
  "phone",
  "consent",
  "cta"
]);
export type FormFieldType = z.infer<typeof FormFieldTypeEnum>;

export const LogicJumpSchema = z.object({
  condition: z.enum(["equals", "not_equals", "contains", "greater_than", "is_submitted"]),
  value: z.any().optional(),
  destinationQuestionId: z.string() // target question id or "end"
});
export type LogicJump = z.infer<typeof LogicJumpSchema>;

export const FormChoiceOptionSchema = z.object({
  id: z.string(),
  label: z.string()
});
export type FormChoiceOption = z.infer<typeof FormChoiceOptionSchema>;

export const FormFieldSchema = z.object({
  id: z.string(),
  type: FormFieldTypeEnum,
  label: z.string().min(1),
  sublabel: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(FormChoiceOptionSchema).optional(), // For single/multi choice
  scale: z.number().int().min(3).max(10).default(5).optional(), // For rating
  consentText: z.string().optional(),
  buttonLabel: z.string().default("Next"),
  logicJumps: z.array(LogicJumpSchema).default([])
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const FormThemeSchema = z.object({
  brandColor: z.string().default("#10B981"),
  backgroundColor: z.string().default("#0B0F17"),
  textColor: z.string().default("#F9FAFB"),
  roundness: z.enum(["none", "sm", "md", "lg", "full"]).default("md"),
  darkMode: z.boolean().default(true)
});
export type FormTheme = z.infer<typeof FormThemeSchema>;

export const FormDefinitionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  customDomain: z.string().optional(), // For paid tiers: e.g. forms.mybrand.com
  fields: z.array(FormFieldSchema).min(1),
  theme: FormThemeSchema.default({
    brandColor: "#10B981",
    backgroundColor: "#0B0F17",
    textColor: "#F9FAFB",
    roundness: "md",
    darkMode: true
  }),
  webhookUrl: z.string().url().optional(),
  thankYouTitle: z.string().default("Thank you!"),
  thankYouMessage: z.string().default("Your response has been recorded successfully."),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now())
});
export type FormDefinition = z.infer<typeof FormDefinitionSchema>;

export const FormResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  answers: z.record(z.any()), // key = field.id, value = answer
  respondentEmail: z.string().email().optional(),
  metadata: z.record(z.any()).optional(),
  submittedAt: z.number().default(() => Date.now())
});
export type FormResponse = z.infer<typeof FormResponseSchema>;
