import { Request } from "express";

export class BadEndpointError extends Error {
  constructor(req: Request) {
    super(`Invalid Endpoint. Path ${req.path} is unknown`);
  }

  jsonResponse() {
    return {
      code: 404,
      error: "Invalid endpoint",
      message: this.message,
    };
  }
}
