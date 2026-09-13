export class GenericEnterpriseDriver {
    id;
    name;
    defaultDailyCap;
    credentials;
    constructor(id, name, credentials, defaultDailyCap = 5000) {
        this.id = id;
        this.name = name;
        this.credentials = credentials;
        this.defaultDailyCap = defaultDailyCap;
    }
    async send(message) {
        const startTime = Date.now();
        const messageId = `${this.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const latencyMs = Date.now() - startTime;
        return {
            status: "sent",
            messageId,
            provider: this.id,
            latencyMs: Math.max(latencyMs, 30),
            attempts: [{ provider: this.id, status: "success", statusCode: 200 }]
        };
    }
    async verifyCredentials() {
        return Boolean(this.credentials.apiKey ||
            this.credentials.serverToken ||
            this.credentials.host ||
            this.credentials.accessKeyId);
    }
    async getRateLimitStatus() {
        return {
            dailyLimit: this.defaultDailyCap,
            dailyUsed: 0,
            resetAt: Date.now() + 86400000
        };
    }
}
//# sourceMappingURL=generic-enterprise.js.map