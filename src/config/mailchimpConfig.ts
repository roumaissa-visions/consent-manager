import { setupEnvironment } from "./env";

setupEnvironment();

const mandrillApiKey = process.env.MANDRILL_API_KEY;
const mandrillFromEmail = process.env.MANDRILL_FROM_EMAIL;
const mandrillFromName = process.env.MANDRILL_FROM_NAME;

export { mandrillApiKey, mandrillFromEmail, mandrillFromName };
