import { Router } from "express";
import {
  providerTriggeredDataExchange,
  userTriggeredDataExchange,
} from "../controllers/dataExchangeController";
import { verifyParticipantJWT, verifyUserJWT } from "../middleware/auth";
const r: Router = Router();

r.post("/push/user", verifyUserJWT, userTriggeredDataExchange);
r.post("/push", verifyParticipantJWT, providerTriggeredDataExchange);
r.post("/pull", async (req, res) => {
  return res.json({ message: "Not implemented, kept for improvements" });
});

export default r;
