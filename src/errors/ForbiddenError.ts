export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }

  jsonResponse() {
    return {
      code: 403,
      error: "forbidden action",
      message: this.message,
    };
  }
}
