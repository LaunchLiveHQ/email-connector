import { z } from "zod";
export declare const FormFieldTypeEnum: z.ZodEnum<["open_text", "multiple_choice_single", "multiple_choice_multi", "rating", "nps", "email", "phone", "consent", "cta"]>;
export type FormFieldType = z.infer<typeof FormFieldTypeEnum>;
export declare const LogicJumpSchema: z.ZodObject<{
    condition: z.ZodEnum<["equals", "not_equals", "contains", "greater_than", "is_submitted"]>;
    value: z.ZodOptional<z.ZodAny>;
    destinationQuestionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
    destinationQuestionId: string;
    value?: any;
}, {
    condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
    destinationQuestionId: string;
    value?: any;
}>;
export type LogicJump = z.infer<typeof LogicJumpSchema>;
export declare const FormChoiceOptionSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
}, {
    id: string;
    label: string;
}>;
export type FormChoiceOption = z.infer<typeof FormChoiceOptionSchema>;
export declare const FormFieldSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["open_text", "multiple_choice_single", "multiple_choice_multi", "rating", "nps", "email", "phone", "consent", "cta"]>;
    label: z.ZodString;
    sublabel: z.ZodOptional<z.ZodString>;
    placeholder: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
    }, {
        id: string;
        label: string;
    }>, "many">>;
    scale: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    consentText: z.ZodOptional<z.ZodString>;
    buttonLabel: z.ZodDefault<z.ZodString>;
    logicJumps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        condition: z.ZodEnum<["equals", "not_equals", "contains", "greater_than", "is_submitted"]>;
        value: z.ZodOptional<z.ZodAny>;
        destinationQuestionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
        destinationQuestionId: string;
        value?: any;
    }, {
        condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
        destinationQuestionId: string;
        value?: any;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "email" | "open_text" | "multiple_choice_single" | "multiple_choice_multi" | "rating" | "nps" | "phone" | "consent" | "cta";
    id: string;
    label: string;
    required: boolean;
    buttonLabel: string;
    logicJumps: {
        condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
        destinationQuestionId: string;
        value?: any;
    }[];
    options?: {
        id: string;
        label: string;
    }[] | undefined;
    sublabel?: string | undefined;
    placeholder?: string | undefined;
    scale?: number | undefined;
    consentText?: string | undefined;
}, {
    type: "email" | "open_text" | "multiple_choice_single" | "multiple_choice_multi" | "rating" | "nps" | "phone" | "consent" | "cta";
    id: string;
    label: string;
    options?: {
        id: string;
        label: string;
    }[] | undefined;
    sublabel?: string | undefined;
    placeholder?: string | undefined;
    required?: boolean | undefined;
    scale?: number | undefined;
    consentText?: string | undefined;
    buttonLabel?: string | undefined;
    logicJumps?: {
        condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
        destinationQuestionId: string;
        value?: any;
    }[] | undefined;
}>;
export type FormField = z.infer<typeof FormFieldSchema>;
export declare const FormThemeSchema: z.ZodObject<{
    brandColor: z.ZodDefault<z.ZodString>;
    backgroundColor: z.ZodDefault<z.ZodString>;
    textColor: z.ZodDefault<z.ZodString>;
    roundness: z.ZodDefault<z.ZodEnum<["none", "sm", "md", "lg", "full"]>>;
    darkMode: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    brandColor: string;
    backgroundColor: string;
    textColor: string;
    roundness: "none" | "sm" | "md" | "lg" | "full";
    darkMode: boolean;
}, {
    brandColor?: string | undefined;
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
    roundness?: "none" | "sm" | "md" | "lg" | "full" | undefined;
    darkMode?: boolean | undefined;
}>;
export type FormTheme = z.infer<typeof FormThemeSchema>;
export declare const FormDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    customDomain: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["open_text", "multiple_choice_single", "multiple_choice_multi", "rating", "nps", "email", "phone", "consent", "cta"]>;
        label: z.ZodString;
        sublabel: z.ZodOptional<z.ZodString>;
        placeholder: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
        }, {
            id: string;
            label: string;
        }>, "many">>;
        scale: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        consentText: z.ZodOptional<z.ZodString>;
        buttonLabel: z.ZodDefault<z.ZodString>;
        logicJumps: z.ZodDefault<z.ZodArray<z.ZodObject<{
            condition: z.ZodEnum<["equals", "not_equals", "contains", "greater_than", "is_submitted"]>;
            value: z.ZodOptional<z.ZodAny>;
            destinationQuestionId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
            destinationQuestionId: string;
            value?: any;
        }, {
            condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
            destinationQuestionId: string;
            value?: any;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "email" | "open_text" | "multiple_choice_single" | "multiple_choice_multi" | "rating" | "nps" | "phone" | "consent" | "cta";
        id: string;
        label: string;
        required: boolean;
        buttonLabel: string;
        logicJumps: {
            condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
            destinationQuestionId: string;
            value?: any;
        }[];
        options?: {
            id: string;
            label: string;
        }[] | undefined;
        sublabel?: string | undefined;
        placeholder?: string | undefined;
        scale?: number | undefined;
        consentText?: string | undefined;
    }, {
        type: "email" | "open_text" | "multiple_choice_single" | "multiple_choice_multi" | "rating" | "nps" | "phone" | "consent" | "cta";
        id: string;
        label: string;
        options?: {
            id: string;
            label: string;
        }[] | undefined;
        sublabel?: string | undefined;
        placeholder?: string | undefined;
        required?: boolean | undefined;
        scale?: number | undefined;
        consentText?: string | undefined;
        buttonLabel?: string | undefined;
        logicJumps?: {
            condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
            destinationQuestionId: string;
            value?: any;
        }[] | undefined;
    }>, "many">;
    theme: z.ZodDefault<z.ZodObject<{
        brandColor: z.ZodDefault<z.ZodString>;
        backgroundColor: z.ZodDefault<z.ZodString>;
        textColor: z.ZodDefault<z.ZodString>;
        roundness: z.ZodDefault<z.ZodEnum<["none", "sm", "md", "lg", "full"]>>;
        darkMode: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        brandColor: string;
        backgroundColor: string;
        textColor: string;
        roundness: "none" | "sm" | "md" | "lg" | "full";
        darkMode: boolean;
    }, {
        brandColor?: string | undefined;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        roundness?: "none" | "sm" | "md" | "lg" | "full" | undefined;
        darkMode?: boolean | undefined;
    }>>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    thankYouTitle: z.ZodDefault<z.ZodString>;
    thankYouMessage: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodNumber>;
    updatedAt: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    fields: {
        type: "email" | "open_text" | "multiple_choice_single" | "multiple_choice_multi" | "rating" | "nps" | "phone" | "consent" | "cta";
        id: string;
        label: string;
        required: boolean;
        buttonLabel: string;
        logicJumps: {
            condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
            destinationQuestionId: string;
            value?: any;
        }[];
        options?: {
            id: string;
            label: string;
        }[] | undefined;
        sublabel?: string | undefined;
        placeholder?: string | undefined;
        scale?: number | undefined;
        consentText?: string | undefined;
    }[];
    theme: {
        brandColor: string;
        backgroundColor: string;
        textColor: string;
        roundness: "none" | "sm" | "md" | "lg" | "full";
        darkMode: boolean;
    };
    thankYouTitle: string;
    thankYouMessage: string;
    createdAt: number;
    updatedAt: number;
    description?: string | undefined;
    customDomain?: string | undefined;
    webhookUrl?: string | undefined;
}, {
    id: string;
    title: string;
    fields: {
        type: "email" | "open_text" | "multiple_choice_single" | "multiple_choice_multi" | "rating" | "nps" | "phone" | "consent" | "cta";
        id: string;
        label: string;
        options?: {
            id: string;
            label: string;
        }[] | undefined;
        sublabel?: string | undefined;
        placeholder?: string | undefined;
        required?: boolean | undefined;
        scale?: number | undefined;
        consentText?: string | undefined;
        buttonLabel?: string | undefined;
        logicJumps?: {
            condition: "equals" | "not_equals" | "contains" | "greater_than" | "is_submitted";
            destinationQuestionId: string;
            value?: any;
        }[] | undefined;
    }[];
    description?: string | undefined;
    customDomain?: string | undefined;
    theme?: {
        brandColor?: string | undefined;
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        roundness?: "none" | "sm" | "md" | "lg" | "full" | undefined;
        darkMode?: boolean | undefined;
    } | undefined;
    webhookUrl?: string | undefined;
    thankYouTitle?: string | undefined;
    thankYouMessage?: string | undefined;
    createdAt?: number | undefined;
    updatedAt?: number | undefined;
}>;
export type FormDefinition = z.infer<typeof FormDefinitionSchema>;
export declare const FormResponseSchema: z.ZodObject<{
    id: z.ZodString;
    formId: z.ZodString;
    answers: z.ZodRecord<z.ZodString, z.ZodAny>;
    respondentEmail: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    submittedAt: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    formId: string;
    answers: Record<string, any>;
    submittedAt: number;
    respondentEmail?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    formId: string;
    answers: Record<string, any>;
    respondentEmail?: string | undefined;
    metadata?: Record<string, any> | undefined;
    submittedAt?: number | undefined;
}>;
export type FormResponse = z.infer<typeof FormResponseSchema>;
//# sourceMappingURL=form.d.ts.map