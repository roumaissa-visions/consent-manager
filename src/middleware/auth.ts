import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Participant from "../models/Participant/Participant.model";

type DecodedServiceJWT = {
  serviceKey: string;
};
export const verifyParticipantJWT = async (
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

  const authorization = req.header("authorization");

  let token;

  token = authorization.split(" ")[1];

  const data = token.split(".");

  if (data.length < 3) {
    return res.status(401).json({
      message: "'" + token + "' is not a valid authorization token",
    });
  }

  const buff = Buffer.from(data[1], "base64");
  const authObject: DecodedServiceJWT = JSON.parse(buff.toString());

  if (!authObject.serviceKey) {
    token = authHeader.slice(7);
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY
      ) as JwtPayload;

      req.decodedToken = decodedToken;
      req.userParticipant = {
        id: decodedToken.sub,
      };
      req.session.userParticipant = { id: decodedToken.sub };

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    const { serviceKey } = authObject;

    const participant = await Participant.findOne({
      clientID: serviceKey,
    }).lean();

    if (!participant)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized resource" });

    try {
      const decoded = jwt.verify(token, participant.clientSecret);
      if (decoded) {
        return next();
      } else {
        return res.status(401).json({
          error: "token-decode-error",
          message: "Unauthorized resource",
        });
      }
    } catch (error) {
      return res
        .status(401)
        .json({ error: error, message: "Unauthorized resource" });
    }
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
