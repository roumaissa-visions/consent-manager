export class BadRequestError extends Error {
  fields?: { field: string; message: string }[];

  constructor(message: string, fields: { field: string; message: string }[]) {
    super(message);
    this.fields = fields;
  }

  jsonResponse() {
    return {
      code: 400,
      error: this.message,
      errors: this.fields,
    };
  }
}
