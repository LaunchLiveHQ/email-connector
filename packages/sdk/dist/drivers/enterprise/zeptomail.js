export class ZeptoMailDriver {
    id = "zeptomail";
    name = "ZeptoMail (Zoho)";
    defaultDailyCap = 333; // 10k free credits test tier (~333/day)
    apiKey;
    constructor(credentials) {
        if (!credentials.apiKey) {
            throw new Error("ZeptoMailDriver requires an apiKey (Send Mail Token)");
        }
        this.apiKey = credentials.apiKey;
    }
    async send(message) {
        const startTime = Date.now();
        const endpoint = "https://api.zeptomail.com/v1.1/email";
        const payload = {
            from: {
                address: message.from.email,
                name: message.from.name || undefined
            },
            to: message.to.map((t) => ({
                email_address: { address: t.email, name: t.name || undefined }
            })),
            subject: message.subject,
            htmlbody: message.html,
            textbody: message.text
        };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Zoho-enczapikey ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`ZeptoMail API failed with status ${res.status}: ${errBody}`);
        }
        const data = (await res.json());
        const messageId = data?.data?.[0]?.message_id || `zm_${Date.now()}`;
        return {
            status: "sent",
            messageId,
            provider: this.id,
            latencyMs,
            attempts: [{ provider: this.id, status: "success", statusCode: res.status }]
        };
    }
    async verifyCredentials() {
        return true;
    }
    async getRateLimitStatus() {
        return {
            dailyLimit: this.defaultDailyCap,
            dailyUsed: 0,
            resetAt: Date.now() + 86400000
        };
    }
}
//# sourceMappingURL=zeptomail.js.map