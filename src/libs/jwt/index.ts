import jwt from "jsonwebtoken";
import { IUser, IParticipant } from "../../types/models";

export const issueJwt = (participant: IParticipant) => {
  const jwtPayload = {
    sub: participant.id,
    participant_name: participant.hasLegallyBindingName,
  };

  const jwtOptions: jwt.SignOptions = {
    expiresIn: "1h",
  };

  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtOptions);
  return token;
};

export const issueUserJwt = (user: IUser) => {
  const jwtPayload = {
    sub: user.id,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
  };

  const jwtOptions: jwt.SignOptions = {
    expiresIn: "1h",
  };

  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, jwtOptions);
  return token;
};
