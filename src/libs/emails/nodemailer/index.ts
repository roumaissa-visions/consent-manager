import { NodemailerEmailClient } from "./classes/NodemailerEmailClient";

/**
 * The global app instance for email management throughout
 * the app using nodemailer
 */
export const NodemailerClient = new NodemailerEmailClient();
