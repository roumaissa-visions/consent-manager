import { Router } from "express";
import {
  getConsentReview,
  getPrivacyNoticeById,
  getPrivacyNotices,
  getUserConsentById,
  getUserConsents,
  giveConsent,
  revokeConsent,
} from "../controllers/consentsController";
import { verifyParticipantJWT, verifyUserJWT } from "../middleware/auth";
// import { checkIDFormatMiddleware } from "../middleware/objectIdFormatCheck";
import { setUserIdForParticipant } from "../middleware/participantsMiddleware";
const r: Router = Router();

r.get("/me", verifyUserJWT, getUserConsents);
r.get(
  "/me/:id",
  verifyUserJWT,
  // checkIDFormatMiddleware,
  getUserConsentById
);

r.get(
  "/:userId/",
  verifyParticipantJWT,
  setUserIdForParticipant,
  getUserConsents
);

r.get(
  "/:userId/:id",
  verifyParticipantJWT,
  setUserIdForParticipant,
  getUserConsentById
);

r.get(
  "/review/:dataProviderId/:dataConsumerId",
  verifyUserJWT,
  getConsentReview
);

r.get("/:userId/:providerId/:consumerId", verifyUserJWT, getPrivacyNotices);
r.get("/:privacyNoticeId", verifyUserJWT, getPrivacyNoticeById);

r.post(
  "/",
  verifyUserJWT,
  // verifyContract,
  giveConsent
);

r.delete("/:id", verifyUserJWT, revokeConsent);

export default r;
