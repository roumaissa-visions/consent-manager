import { Types } from "mongoose";
import { BadRequestError } from "../errors/BadRequestError";
import { NextFunction, Request, Response } from "express";

/**
 * Checks if the req.params.id is in the correct mongoose
 * Types ObjectID format
 */
export const checkIDFormatMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    if (Types.ObjectId.isValid(id)) next();
    else
      throw new BadRequestError("Invalid ID format", [
        { field: "id", message: "Must be of type ObjectId" },
      ]);
  } catch (err) {
    next(err);
  }
};

/**
 * Checks if the ID is in the Types.ObjectId format
 * ! Not a middleware but makes sense to have it here
 */
export const isObjectID = (id: string, fieldName?: string) => {
  if (Types.ObjectId.isValid(id)) return true;
  else
    throw new BadRequestError("Invalid ID format", [
      { field: fieldName || "id", message: "Must be of type ObjectId" },
    ]);
};
