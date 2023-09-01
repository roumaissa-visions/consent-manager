export class ThirdPartyError extends Error {
  constructor(message?: string) {
    super(message);
  }

  jsonResponse() {
    return {
      code: 400,
      error: "Third party service failed to provide results",
      message: this.message,
    };
  }
}
