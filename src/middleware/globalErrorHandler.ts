import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/BadRequestError";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof BadRequestError) {
    return res.status(400).json(err.jsonResponse());
  } else {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong",
      devErr:
        process.env.NODE_ENV === "development"
          ? { msg: err.message, stack: err.stack, name: err.name }
          : undefined,
    });
  }

  next(err);
};
