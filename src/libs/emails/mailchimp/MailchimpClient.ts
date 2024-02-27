import mailchimp from '@mailchimp/mailchimp_transactional';
import { MailchimpEmailClient } from './MailchimpEmailClient';
import * as mailchimpConfig from '../../../config/mailchimpConfig';

const { mandrillApiKey, mandrillFromEmail, mandrillFromName } = mailchimpConfig;

const client = mailchimp(mandrillApiKey);

/**
 * The global app instance for email management
 * through mailchimp & more specifically mandrill
 */
export const MailchimpClient = mandrillApiKey
    ? new MailchimpEmailClient(client, mandrillFromEmail, mandrillFromName)
    : new MailchimpEmailClient(null);
