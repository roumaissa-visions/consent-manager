import { NextFunction, Request, Response } from "express";
import {
  participantCreationSchema,
  participantUpdateSchema,
} from "../libs/joi/participantSchemas";
import { ValidationError } from "joi";

/**
 * Sets the Joi schema to use as validation
 * against the incoming request payload
 */
export const setJoiValidationSchema = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { method, originalUrl } = req;
    let schema;
    if (originalUrl.includes("participants")) {
      schema =
        method === "POST" ? participantCreationSchema : participantUpdateSchema;
    }

    req.validationSchema = schema;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validates the payload against the set joi schema
 * Must be used after setJoiValidationSchema middleware
 */
export const validatePayload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationSchema = req.validationSchema;
    const { error, value: validatedPayload } = validationSchema.validate(
      req.body,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      return res.status(400).json({ error: error.details });
    }

    req.body = validatedPayload;
    next();
  } catch (err) {
    if (err instanceof ValidationError)
      return res.status(400).json({ error: err.details });
    next(err);
  }
};
