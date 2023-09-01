export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
  }

  jsonResponse() {
    return {
      code: 404,
      error: "resource not found",
      message: this.message,
    };
  }
}
