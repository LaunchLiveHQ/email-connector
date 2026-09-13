export class MailerSendDriver {
    id = "mailersend";
    name = "MailerSend";
    defaultDailyCap = 100; // 100/day free limit (3,000/mo)
    apiKey;
    constructor(credentials) {
        if (!credentials.apiKey) {
            throw new Error("MailerSendDriver requires an apiKey");
        }
        this.apiKey = credentials.apiKey;
    }
    async send(message) {
        const startTime = Date.now();
        const endpoint = "https://api.mailersend.com/v1/email";
        const payload = {
            from: {
                email: message.from.email,
                name: message.from.name || undefined
            },
            to: message.to.map((t) => ({ email: t.email, name: t.name || undefined })),
            subject: message.subject,
            html: message.html,
            text: message.text,
            reply_to: message.replyTo ? { email: message.replyTo } : undefined
        };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`MailerSend API failed with status ${res.status}: ${errBody}`);
        }
        const messageId = res.headers.get("x-message-id") || `ms_${Date.now()}`;
        return {
            status: "sent",
            messageId,
            provider: this.id,
            latencyMs,
            attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
        };
    }
    async verifyCredentials() {
        try {
            const res = await fetch("https://api.mailersend.com/v1/domains", {
                headers: { Authorization: `Bearer ${this.apiKey}` }
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
//# sourceMappingURL=mailersend.js.map