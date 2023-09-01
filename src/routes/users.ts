import { Router } from "express";
import {
  registerUserIdentifier,
  signup,
  login,
  getUserById,
} from "../controllers/usersController";
const r: Router = Router();

r.post("/signup", signup);
r.post("/login", login);

// Used by Participants to register a end user from their platform
// This might change when using more decentralized identifiers for end users
r.post("/register", registerUserIdentifier);
r.get("/:userId/", getUserById);
r.get("/:userId/:consentId");

export default r;
