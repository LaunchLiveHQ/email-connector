import * as crypto from "node:crypto";
export class WebhookSignature {
    /**
     * Generates a Standard Webhook signature header
     */
    static sign(payload, secret, timestamp = Math.floor(Date.now() / 1000)) {
        const toSign = `${timestamp}.${payload}`;
        const hmac = crypto.createHmac("sha256", secret).update(toSign).digest("base64");
        return `t=${timestamp},v1=${hmac}`;
    }
    /**
     * Verifies an incoming webhook against the Standard Webhook specification
     */
    static verify(options) {
        const { secret, payload, headers, toleranceSeconds = 300 } = options;
        const signatureHeader = headers["webhook-signature"] ||
            headers["Webhook-Signature"] ||
            headers["stripe-signature"] ||
            headers["x-svix-signature"];
        if (!signatureHeader || typeof signatureHeader !== "string") {
            return false;
        }
        // Parse parts: t=1234567,v1=signature
        const parts = signatureHeader.split(",");
        let timestampStr = "";
        let signatureStr = "";
        for (const part of parts) {
            const trimmed = part.trim();
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx === -1)
                continue;
            const key = trimmed.slice(0, eqIdx);
            const val = trimmed.slice(eqIdx + 1);
            if (key === "t")
                timestampStr = val;
            if (key === "v1")
                signatureStr = val;
        }
        if (!timestampStr || !signatureStr) {
            return false;
        }
        const timestamp = parseInt(timestampStr, 10);
        const now = Math.floor(Date.now() / 1000);
        // Anti-replay protection: check timestamp is within tolerance window
        if (Math.abs(now - timestamp) > toleranceSeconds) {
            return false;
        }
        const payloadStr = typeof payload === "string" ? payload : payload.toString("utf8");
        const expectedToSign = `${timestamp}.${payloadStr}`;
        const expectedSig = crypto.createHmac("sha256", secret).update(expectedToSign).digest("base64");
        try {
            return crypto.timingSafeEqual(Buffer.from(signatureStr), Buffer.from(expectedSig));
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=signature.js.map