export interface WebhookVerificationOptions {
    secret: string;
    payload: string | Buffer;
    headers: Record<string, string | string[] | undefined>;
    toleranceSeconds?: number;
}
export declare class WebhookSignature {
    /**
     * Generates a Standard Webhook signature header
     */
    static sign(payload: string, secret: string, timestamp?: number): string;
    /**
     * Verifies an incoming webhook against the Standard Webhook specification
     */
    static verify(options: WebhookVerificationOptions): boolean;
}
//# sourceMappingURL=signature.d.ts.map