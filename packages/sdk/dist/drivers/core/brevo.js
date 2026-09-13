export class BrevoDriver {
    id = "brevo";
    name = "Brevo";
    defaultDailyCap = 300; // 300/day free limit (9,000/mo)
    apiKey;
    constructor(credentials) {
        if (!credentials.apiKey) {
            throw new Error("BrevoDriver requires an apiKey");
        }
        this.apiKey = credentials.apiKey;
    }
    async send(message) {
        const startTime = Date.now();
        const endpoint = "https://api.brevo.com/v3/smtp/email";
        const payload = {
            sender: {
                name: message.from.name || undefined,
                email: message.from.email
            },
            to: message.to.map((t) => ({ name: t.name || undefined, email: t.email })),
            subject: message.subject,
            htmlContent: message.html,
            textContent: message.text,
            replyTo: message.replyTo ? { email: message.replyTo } : undefined,
            headers: message.headers,
            tags: message.tags ? Object.values(message.tags) : undefined
        };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "api-key": this.apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Brevo API failed with status ${res.status}: ${errBody}`);
        }
        const data = (await res.json());
        return {
            status: "sent",
            messageId: data.messageId,
            provider: this.id,
            latencyMs,
            attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
        };
    }
    async verifyCredentials() {
        try {
            const res = await fetch("https://api.brevo.com/v3/account", {
                headers: { "api-key": this.apiKey }
            });
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async getRateLimitStatus() {
        return {
            dailyLimit: this.defaultDailyCap,
            dailyUsed: 0,
            resetAt: Date.now() + 86400000
        };
    }
}
//# sourceMappingURL=brevo.js.map