export class NodemailerEmailClientError extends Error {
  isNodemailerEmailClientError = true;

  constructor(message?: string) {
    super(message || "Failed to send email through email client");
  }
}
