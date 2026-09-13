import { z } from "zod";
export const PaymentGatewayEnum = z.enum([
    "stripe",
    "paypal",
    "cashfree",
    "razorpay",
    "dodopayments",
    "creem"
]);
export const CheckoutFeeTypeEnum = z.enum(["fixed", "percentage", "combination"]);
export const CheckoutFeeRuleSchema = z.object({
    feeType: CheckoutFeeTypeEnum.default("combination"),
    fixedAmount: z.number().nonnegative().default(0.30), // e.g. $0.30 or ₹5
    percentageAmount: z.number().nonnegative().default(2.9), // e.g. 2.9%
    label: z.string().default("Processing & Checkout Fee")
});
export function calculateCheckoutFee(basePrice, rule) {
    const feeType = rule?.feeType ?? "combination";
    const fixed = rule?.fixedAmount ?? 0;
    const pct = rule?.percentageAmount ?? 0;
    const label = rule?.label ?? "Processing & Checkout Fee";
    let fee = 0;
    if (feeType === "fixed" || feeType === "combination") {
        fee += fixed;
    }
    if (feeType === "percentage" || feeType === "combination") {
        fee += (basePrice * pct) / 100;
    }
    // 2 decimal precision
    const feeRounded = Math.round(fee * 100) / 100;
    const totalRounded = Math.round((basePrice + feeRounded) * 100) / 100;
    return {
        basePrice,
        feeAmount: feeRounded,
        totalAmount: totalRounded,
        feeLabel: label
    };
}
export const TransactionStatusEnum = z.enum(["pending", "completed", "failed", "refunded"]);
export const CheckoutPayloadSchema = z.object({
    planId: z.string(),
    planName: z.string(),
    itemType: z.enum(["subscription", "sponsorship"]),
    gateway: PaymentGatewayEnum,
    basePriceUsd: z.number().positive(),
    customerEmail: z.string().email(),
    customerName: z.string().optional(),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    feeRule: CheckoutFeeRuleSchema.optional()
});
export const PaymentTransactionSchema = z.object({
    id: z.string(),
    gateway: PaymentGatewayEnum,
    status: TransactionStatusEnum.default("pending"),
    basePrice: z.number(),
    feeAmount: z.number(),
    totalAmount: z.number(),
    currency: z.string().default("USD"),
    customerEmail: z.string().email(),
    customerName: z.string().optional(),
    itemType: z.enum(["subscription", "sponsorship"]),
    itemId: z.string(),
    gatewayReference: z.string().optional(),
    redirectUrl: z.string().url().optional(),
    createdAt: z.number().default(() => Date.now()),
    completedAt: z.number().optional()
});
//# sourceMappingURL=payment.js.map