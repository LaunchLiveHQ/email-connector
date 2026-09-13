import { ResendDriver } from "./core/resend.js";
import { BrevoDriver } from "./core/brevo.js";
import { MailjetDriver } from "./core/mailjet.js";
import { MailerSendDriver } from "./core/mailersend.js";
import { SendGridDriver } from "./core/sendgrid.js";
import { SmtpDriver } from "./core/smtp.js";
import { ZeptoMailDriver } from "./enterprise/zeptomail.js";
import { PostmarkDriver } from "./enterprise/postmark.js";
import { AwsSesDriver } from "./enterprise/ses.js";
import { GenericEnterpriseDriver } from "./enterprise/generic-enterprise.js";
export function createDriver(driverType, credentials) {
    switch (driverType) {
        // Core Free Tier
        case "resend":
            return new ResendDriver(credentials);
        case "brevo":
            return new BrevoDriver(credentials);
        case "mailjet":
            return new MailjetDriver(credentials);
        case "mailersend":
            return new MailerSendDriver(credentials);
        case "sendgrid":
            return new SendGridDriver(credentials);
        case "smtp":
            return new SmtpDriver(credentials);
        // Enterprise Tier
        case "zeptomail":
            return new ZeptoMailDriver(credentials);
        case "postmark":
            return new PostmarkDriver(credentials);
        case "aws_ses":
            return new AwsSesDriver(credentials);
        default:
            return new GenericEnterpriseDriver(driverType, driverType.toUpperCase(), credentials);
    }
}
export function createDriverFromServer(server) {
    return createDriver(server.driver, server.credentials);
}
//# sourceMappingURL=factory.js.map