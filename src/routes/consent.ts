import { Router } from "express";
import {
  attachTokenToConsent,
  getAvailableExchanges,
  getPrivacyNoticeById,
  getPrivacyNotices,
  getUserConsentById,
  getUserConsents,
  giveConsent,
  giveConsentOnEmailValidation,
  resumeConsent,
  revokeConsent,
  triggerDataExchange,
  verifyToken,
} from "../controllers/consentsController";
import {
  verifyInternalId,
  verifyParticipantJWT,
  verifyUserJWT,
} from "../middleware/auth";
// import { checkIDFormatMiddleware } from "../middleware/objectIdFormatCheck";
import { setUserIdForParticipant } from "../middleware/participantsMiddleware";
const r: Router = Router();

r.get("/emailverification", giveConsentOnEmailValidation);
r.get("/me", verifyUserJWT, getUserConsents);
r.get(
  "/me/:id",
  verifyUserJWT,
  // checkIDFormatMiddleware,
  getUserConsentById
);

r.get("/exchanges/:as", verifyParticipantJWT, getAvailableExchanges);

r.get(
  "/privacy-notices/:privacyNoticeId",
  verifyInternalId,
  getPrivacyNoticeById
); //TODO jwt

r.get(
  "/participants/:userId/",
  verifyParticipantJWT,
  setUserIdForParticipant,
  getUserConsents
);

r.get(
  "/participants/:userId/:id",
  verifyParticipantJWT,
  setUserIdForParticipant,
  getUserConsentById
);

r.get("/:userId/:providerId/:consumerId", verifyInternalId, getPrivacyNotices); //TODO userID jwt

r.post(
  "/",
  verifyInternalId,
  // verifyContract,
  giveConsent
);

r.delete("/:id", verifyUserJWT, revokeConsent);

r.post(
  "/:consentId/data-exchange",
  verifyInternalId,
  // verifyContract,
  triggerDataExchange
);

r.post(
  "/:consentId/resume",
  verifyParticipantJWT,
  // verifyContract,
  resumeConsent
);

r.post(
  "/:consentId/token",
  verifyParticipantJWT,
  // verifyContract,
  attachTokenToConsent
);

r.post(
  "/:consentId/validate",
  verifyParticipantJWT,
  // verifyContract,
  verifyToken
);

export default r;
