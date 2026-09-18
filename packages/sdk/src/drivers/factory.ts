import { EmailDriver } from "./driver.js";
// Core Free Tier
import { ResendDriver } from "./core/resend.js";
import { BrevoDriver } from "./core/brevo.js";
import { MailjetDriver } from "./core/mailjet.js";
import { MailerSendDriver } from "./core/mailersend.js";
import { SendGridDriver } from "./core/sendgrid.js";
import { SmtpDriver } from "./core/smtp.js";
// Enterprise & Cloud Fleet
import { ZeptoMailDriver } from "./enterprise/zeptomail.js";
import { PostmarkDriver } from "./enterprise/postmark.js";
import { AwsSesDriver } from "./enterprise/ses.js";
import { SendPulseDriver } from "./enterprise/sendpulse.js";
import { AzureCommunicationDriver } from "./enterprise/azure.js";
import { Smtp2goDriver } from "./enterprise/smtp2go.js";
import { MailgunDriver } from "./enterprise/mailgun.js";
import { MailtrapDriver } from "./enterprise/mailtrap.js";
import { ScalewayDriver } from "./enterprise/scaleway.js";
import { PlunkDriver } from "./enterprise/plunk.js";
import { LoopsDriver } from "./enterprise/loops.js";
import { SparkPostDriver } from "./enterprise/sparkpost.js";
import { MandrillDriver } from "./enterprise/mandrill.js";
import { MailPaceDriver } from "./enterprise/mailpace.js";
import { CloudflareDriver } from "./enterprise/cloudflare.js";
import { IterableDriver } from "./enterprise/iterable.js";
import { JetEmailDriver } from "./enterprise/jetemail.js";
import { LettermintDriver } from "./enterprise/lettermint.js";
import { LettrDriver } from "./enterprise/lettr.js";
import { SequenzyDriver } from "./enterprise/sequenzy.js";
import { UnosendDriver } from "./enterprise/unosend.js";
import { PrimitiveDriver } from "./enterprise/primitive.js";
import { AhaSendDriver } from "./enterprise/ahasend.js";
import { MailChannelsDriver } from "./enterprise/mailchannels.js";
import { GenericEnterpriseDriver } from "./enterprise/generic-enterprise.js";
import { DriverType, DriverCredentials } from "@emailconnector/config-schema";

export function createDriver(driverType: DriverType, credentials: DriverCredentials): EmailDriver {
  switch (driverType) {
    // Core Free Tier (24k Free Pool)
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

    // Enterprise & Modern Global ESP Fleet
    case "sendpulse":
      return new SendPulseDriver(credentials);
    case "aws_ses":
      return new AwsSesDriver(credentials);
    case "azure":
      return new AzureCommunicationDriver(credentials);
    case "smtp2go":
      return new Smtp2goDriver(credentials);
    case "postmark":
      return new PostmarkDriver(credentials);
    case "zeptomail":
      return new ZeptoMailDriver(credentials);
    case "mailgun":
      return new MailgunDriver(credentials);
    case "mailtrap":
      return new MailtrapDriver(credentials);
    case "scaleway":
      return new ScalewayDriver(credentials);
    case "plunk":
      return new PlunkDriver(credentials);
    case "loops":
      return new LoopsDriver(credentials);
    case "sparkpost":
      return new SparkPostDriver(credentials);
    case "mandrill":
      return new MandrillDriver(credentials);
    case "mailpace":
      return new MailPaceDriver(credentials);
    case "cloudflare":
      return new CloudflareDriver(credentials);
    case "iterable":
      return new IterableDriver(credentials);
    case "jetemail":
      return new JetEmailDriver(credentials);
    case "lettermint":
      return new LettermintDriver(credentials);
    case "lettr":
      return new LettrDriver(credentials);
    case "sequenzy":
      return new SequenzyDriver(credentials);
    case "unosend":
      return new UnosendDriver(credentials);
    case "primitive":
      return new PrimitiveDriver(credentials);
    case "ahasend":
      return new AhaSendDriver(credentials);
    case "mailchannels":
      return new MailChannelsDriver(credentials);

    default:
      return new GenericEnterpriseDriver(driverType, (driverType as string).toUpperCase(), credentials);
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
    clientId: server.clientId,
    clientSecret: server.clientSecret,
    connectionString: server.connectionString,
    endpoint: server.endpoint,
    fastAccept: server.fastAccept
  }) as DriverCredentials;

  return createDriver(driverType, credentials);
}
