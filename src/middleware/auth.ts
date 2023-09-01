import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyParticipantJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.userParticipant) {
    req.userParticipant = { id: req.session.userParticipant.id };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.slice(7);

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    ) as JwtPayload;

    req.decodedToken = decodedToken;
    req.userParticipant = {
      id: decodedToken.sub,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifyUserJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.user) {
    req.user = {
      id: req.session.user.id,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.slice(7);

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    ) as JwtPayload;

    req.decodedToken = decodedToken;
    req.user = {
      id: decodedToken.sub,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
