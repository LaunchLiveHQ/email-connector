import { z } from "zod";
export declare const PaymentGatewayEnum: z.ZodEnum<["stripe", "paypal", "cashfree", "razorpay", "dodopayments", "creem"]>;
export type PaymentGateway = z.infer<typeof PaymentGatewayEnum>;
export declare const CheckoutFeeTypeEnum: z.ZodEnum<["fixed", "percentage", "combination"]>;
export type CheckoutFeeType = z.infer<typeof CheckoutFeeTypeEnum>;
export declare const CheckoutFeeRuleSchema: z.ZodObject<{
    feeType: z.ZodDefault<z.ZodEnum<["fixed", "percentage", "combination"]>>;
    fixedAmount: z.ZodDefault<z.ZodNumber>;
    percentageAmount: z.ZodDefault<z.ZodNumber>;
    label: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    label: string;
    feeType: "fixed" | "percentage" | "combination";
    fixedAmount: number;
    percentageAmount: number;
}, {
    label?: string | undefined;
    feeType?: "fixed" | "percentage" | "combination" | undefined;
    fixedAmount?: number | undefined;
    percentageAmount?: number | undefined;
}>;
export type CheckoutFeeRule = z.infer<typeof CheckoutFeeRuleSchema>;
export interface CheckoutCalculation {
    basePrice: number;
    feeAmount: number;
    totalAmount: number;
    feeLabel: string;
}
export declare function calculateCheckoutFee(basePrice: number, rule?: Partial<CheckoutFeeRule>): CheckoutCalculation;
export declare const TransactionStatusEnum: z.ZodEnum<["pending", "completed", "failed", "refunded"]>;
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;
export declare const CheckoutPayloadSchema: z.ZodObject<{
    planId: z.ZodString;
    planName: z.ZodString;
    itemType: z.ZodEnum<["subscription", "sponsorship"]>;
    gateway: z.ZodEnum<["stripe", "paypal", "cashfree", "razorpay", "dodopayments", "creem"]>;
    basePriceUsd: z.ZodNumber;
    customerEmail: z.ZodString;
    customerName: z.ZodOptional<z.ZodString>;
    successUrl: z.ZodOptional<z.ZodString>;
    cancelUrl: z.ZodOptional<z.ZodString>;
    feeRule: z.ZodOptional<z.ZodObject<{
        feeType: z.ZodDefault<z.ZodEnum<["fixed", "percentage", "combination"]>>;
        fixedAmount: z.ZodDefault<z.ZodNumber>;
        percentageAmount: z.ZodDefault<z.ZodNumber>;
        label: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        feeType: "fixed" | "percentage" | "combination";
        fixedAmount: number;
        percentageAmount: number;
    }, {
        label?: string | undefined;
        feeType?: "fixed" | "percentage" | "combination" | undefined;
        fixedAmount?: number | undefined;
        percentageAmount?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    planId: string;
    planName: string;
    itemType: "subscription" | "sponsorship";
    gateway: "stripe" | "paypal" | "cashfree" | "razorpay" | "dodopayments" | "creem";
    basePriceUsd: number;
    customerEmail: string;
    customerName?: string | undefined;
    successUrl?: string | undefined;
    cancelUrl?: string | undefined;
    feeRule?: {
        label: string;
        feeType: "fixed" | "percentage" | "combination";
        fixedAmount: number;
        percentageAmount: number;
    } | undefined;
}, {
    planId: string;
    planName: string;
    itemType: "subscription" | "sponsorship";
    gateway: "stripe" | "paypal" | "cashfree" | "razorpay" | "dodopayments" | "creem";
    basePriceUsd: number;
    customerEmail: string;
    customerName?: string | undefined;
    successUrl?: string | undefined;
    cancelUrl?: string | undefined;
    feeRule?: {
        label?: string | undefined;
        feeType?: "fixed" | "percentage" | "combination" | undefined;
        fixedAmount?: number | undefined;
        percentageAmount?: number | undefined;
    } | undefined;
}>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
export declare const PaymentTransactionSchema: z.ZodObject<{
    id: z.ZodString;
    gateway: z.ZodEnum<["stripe", "paypal", "cashfree", "razorpay", "dodopayments", "creem"]>;
    status: z.ZodDefault<z.ZodEnum<["pending", "completed", "failed", "refunded"]>>;
    basePrice: z.ZodNumber;
    feeAmount: z.ZodNumber;
    totalAmount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    customerEmail: z.ZodString;
    customerName: z.ZodOptional<z.ZodString>;
    itemType: z.ZodEnum<["subscription", "sponsorship"]>;
    itemId: z.ZodString;
    gatewayReference: z.ZodOptional<z.ZodString>;
    redirectUrl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodNumber>;
    completedAt: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "pending" | "completed" | "refunded";
    id: string;
    createdAt: number;
    itemType: "subscription" | "sponsorship";
    gateway: "stripe" | "paypal" | "cashfree" | "razorpay" | "dodopayments" | "creem";
    customerEmail: string;
    basePrice: number;
    feeAmount: number;
    totalAmount: number;
    currency: string;
    itemId: string;
    customerName?: string | undefined;
    gatewayReference?: string | undefined;
    redirectUrl?: string | undefined;
    completedAt?: number | undefined;
}, {
    id: string;
    itemType: "subscription" | "sponsorship";
    gateway: "stripe" | "paypal" | "cashfree" | "razorpay" | "dodopayments" | "creem";
    customerEmail: string;
    basePrice: number;
    feeAmount: number;
    totalAmount: number;
    itemId: string;
    status?: "failed" | "pending" | "completed" | "refunded" | undefined;
    createdAt?: number | undefined;
    customerName?: string | undefined;
    currency?: string | undefined;
    gatewayReference?: string | undefined;
    redirectUrl?: string | undefined;
    completedAt?: number | undefined;
}>;
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;
//# sourceMappingURL=payment.d.ts.map