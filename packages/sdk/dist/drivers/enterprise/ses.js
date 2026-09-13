export class AwsSesDriver {
    id = "aws_ses";
    name = "AWS SES";
    defaultDailyCap = 50000;
    accessKeyId;
    secretAccessKey;
    region;
    constructor(credentials) {
        this.accessKeyId = credentials.accessKeyId || credentials.apiKey;
        this.secretAccessKey = credentials.secretAccessKey || credentials.secretKey;
        this.region = credentials.region || "us-east-1";
    }
    async send(message) {
        const startTime = Date.now();
        // Simulate AWS SES v2 SendEmail command
        const messageId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const latencyMs = Date.now() - startTime;
        return {
            status: "sent",
            messageId,
            provider: this.id,
            latencyMs: Math.max(latencyMs, 45),
            attempts: [{ provider: this.id, status: "success", statusCode: 200 }]
        };
    }
    async verifyCredentials() {
        return Boolean(this.accessKeyId && this.secretAccessKey);
    }
    async getRateLimitStatus() {
        return {
            dailyLimit: this.defaultDailyCap,
            dailyUsed: 0,
            resetAt: Date.now() + 86400000
        };
    }
}
//# sourceMappingURL=ses.js.map