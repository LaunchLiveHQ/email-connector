import { EmailDriver } from "./driver.js";
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
import { DriverType, DriverCredentials, SendingServer } from "@emailconnector/config-schema";

export function createDriver(driverType: DriverType, credentials: DriverCredentials): EmailDriver {
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

export function createDriverFromServer(server: any): EmailDriver {
  const driverType = (server.driver || server.provider || "smtp") as DriverType;
  const credentials = (server.credentials || {
    apiKey: server.apiKey,
    secretKey: server.apiSecret || server.secretKey,
    serverToken: server.serverToken,
    domain: server.domain,
    host: server.host,
    port: server.port,
    user: server.user,
    password: server.password,
    encryption: server.encryption,
    accessKeyId: server.accessKeyId,
    secretAccessKey: server.secretAccessKey,
    region: server.region,
  }) as DriverCredentials;
  return createDriver(driverType, credentials);
}
