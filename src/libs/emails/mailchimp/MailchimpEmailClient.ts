import {
  ApiClient,
  MergeVar,
  MessagesMessage,
  MessagesSendRequest,
} from "@mailchimp/mailchimp_transactional";
import { Logger } from "../../loggers";
import { EmailMailchimpTemplates, EmailTemplates } from "../templates";

export class MailchimpEmailClient {
  client: ApiClient;

  /**
   * Default "From Email"
   */
  baseFromMail: string;

  /**
   * Default "From Name"
   */
  baseFromName: string;

  /**
   * If the env config is set for mandrill API key
   * then this will be activated, otherwise, it wont
   */
  activated: boolean;

  constructor(client: ApiClient, fromMail?: string, fromName?: string) {
    this.client = client;
    this.activated = !!client;
    this.baseFromMail = fromMail || "";
    this.baseFromName = fromName || "";
  }

  private preSend(options: MessagesSendRequest) {
    options.message.from_email =
      options.message.from_email || this.baseFromMail;
    options.message.from_name = options.message.from_name || this.baseFromName;
    return options;
  }

  async sendMessage(options: MessagesSendRequest) {
    if (!this.activated) return;

    const res = await this.client.messages.send(this.preSend(options));

    if (res instanceof Error) {
      Logger.error({
        location: "MailchimpEmailClient.sendMessage",
        message: `${res}`,
      });
    }

    return res;
  }

  async sendMessageFromLocalTemplate(
    options: MessagesSendRequest,
    templateName: keyof typeof EmailTemplates,
    variables?: { [key: string]: string }
  ) {
    if (!this.activated) return;

    options.message.html = EmailTemplates[templateName](variables) || "";
    const res = await this.client.messages.send(this.preSend(options));

    if (res instanceof Error) {
      Logger.error({
        location: "MailchimpEmailClient.sendMessageFromLocalTemplate",
        message: res.message,
      });
    }

    return res;
  }

  async sendMessageFromTemplate(
    options: MessagesMessage,
    templateName: string,
    variables?: MergeVar[]
  ) {
    if (!this.activated) return;

    const res = await this.client.messages.sendTemplate({
      message: {
        ...options,
        merge_vars: [
          {
            rcpt: options.to[0].email,
            vars: variables,
          },
        ],
      },
      template_content: [],
      template_name: (EmailMailchimpTemplates as any)[templateName].slug,
    });

    if (res instanceof Error) {
      Logger.error({
        location: "MailchimpEmailClient.sendMessageFromTemplate",
        message: res.message,
      });
    }

    return res;
  }
}
