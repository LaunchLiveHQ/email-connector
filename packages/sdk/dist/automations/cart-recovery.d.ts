import { ZeroTrustBalancer } from "../balancer.js";
import { SendResult } from "@emailconnector/config-schema";
export interface AbandonedCartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}
export interface AbandonedCartPayload {
    cartId: string;
    customerEmail: string;
    customerName?: string;
    items: AbandonedCartItem[];
    cartTotal: number;
    recoveryUrl: string;
    discountCode?: string;
    abandonedAt: number;
}
export declare class CartRecoveryAutomation {
    private balancer;
    constructor(balancer: ZeroTrustBalancer);
    /**
     * Generates a modern abandoned cart HTML email template
     */
    generateCartHtml(cart: AbandonedCartPayload): string;
    /**
     * Dispatches the cart recovery email using available daily quota across connected providers
     */
    dispatchRecoveryEmail(cart: AbandonedCartPayload, sender: {
        email: string;
        name?: string;
    }): Promise<SendResult>;
}
//# sourceMappingURL=cart-recovery.d.ts.map