import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import User from "../models/User/User.model";
import UserIdentifier from "../models/UserIdentifier/UserIdentifier.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../libs/OAuth/tokens";
import { OAUTH_SCOPES } from "../libs/OAuth/scopes";
import { NotFoundError } from "../errors/NotFoundError";
import { userToSelfDescription } from "../libs/jsonld/selfDescriptions";
import { USER_SELECTION } from "../utils/schemaSelection";

/**
 * Registers a new user in the PDI
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = new User({ firstName, lastName, email, password });

    const scopes = [OAUTH_SCOPES.userRead, OAUTH_SCOPES.userWrite];
    const accessToken = generateAccessToken(user, scopes);
    const refreshToken = await generateRefreshToken(user, { save: false });

    user.oauth = {
      scopes: scopes,
      refreshToken: refreshToken,
    };

    user.jsonld = userToSelfDescription(user);

    await user.save();

    return res.json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

/**
 * Logs in a user in the PDI
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    const scopes = [OAUTH_SCOPES.userRead, OAUTH_SCOPES.userWrite];
    const accessToken = generateAccessToken(user, scopes);
    const refreshToken = await generateRefreshToken(user);

    req.session.user = {
      id: user.id,
      oath: {
        accessToken,
        refreshToken,
      },
    };

    user.oauth.refreshToken = refreshToken;
    await user.save();

    const publicUser = await User.findById(user.id).select(USER_SELECTION);

    return res.json({ user: publicUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

/**
 * Finds a user by ID and returns it
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.userId).select(USER_SELECTION);
    if (!user) throw new NotFoundError();

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Registers a new user identifier in the PDI
 * Used by Participants to declare users from their platform
 * @author Felix Bole
 */
export const registerUserIdentifier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, identifier } = req.body;
    if (!email && !identifier)
      throw new BadRequestError("Missing or invalid fields", [
        { field: "email", message: "Email must exist if identifier does not" },
        {
          field: "identifier",
          message: "identifier must exist if email does not",
        },
      ]);

    const newId = new UserIdentifier({
      attachedParticipant: req.userParticipant.id,
      email,
      identifier,
    });

    await newId.save();
    return res.json(newId);
  } catch (err) {
    next(err);
  }
};
