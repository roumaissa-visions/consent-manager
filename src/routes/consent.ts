import { Router } from "express";
import {
  attachTokenToConsent,
  getAvailableExchanges,
  getPrivacyNoticeById,
  getPrivacyNotices,
  getPrivacyNoticesByContract,
  getUserAvailableExchanges,
  getUserConsentById,
  getUserConsents,
  giveConsent,
  giveConsentOnEmailValidation,
  giveConsentUser,
  resumeConsent,
  revokeConsent,
  triggerDataExchange,
  verifyToken,
} from "../controllers/consentsController";
import {
  verifyUserKey,
  verifyParticipantJWT,
  verifyUserJWT,
} from "../middleware/auth";
// import { checkIDFormatMiddleware } from "../middleware/objectIdFormatCheck";
import { setUserIdForParticipant } from "../middleware/participantsMiddleware";
const r: Router = Router();

r.get("/emailverification", giveConsentOnEmailValidation);
r.get("/me", verifyUserKey, getUserConsents);
r.get(
  "/me/:id",
  verifyUserKey,
  // checkIDFormatMiddleware,
  getUserConsentById
);

r.get("/exchanges/user", verifyUserJWT, getUserAvailableExchanges);

r.get("/exchanges/:as", verifyParticipantJWT, getAvailableExchanges);

r.get("/privacy-notices/:privacyNoticeId", verifyUserKey, getPrivacyNoticeById); //TODO jwt

r.get(
  "/privacy-notices/:privacyNoticeId/user",
  verifyUserJWT,
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

r.get("/:userId/:providerId/:consumerId", verifyUserKey, getPrivacyNotices); //TODO userID jwt
r.get(
  "/:userId/:providerURI/:consumerURI/:contractURI",
  verifyUserJWT,
  getPrivacyNoticesByContract
);

r.post(
  "/",
  verifyUserKey,
  // verifyContract,
  giveConsent
);

r.post(
  "/user",
  verifyUserJWT,
  // verifyContract,
  giveConsentUser
);

r.delete("/:id", verifyUserKey, revokeConsent);

r.post(
  "/:consentId/data-exchange",
  verifyUserKey,
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

r.get("/pdi/iframe", verifyParticipantJWT, (req, res) => {
  // let parsedUrl = url.parse(req.url);
  // res.set("Authorization", `Bearer ${req.query.participant}`);

  if (process.env.PDI_ENDPOINT) {
    res.redirect(
      `${process.env.PDI_ENDPOINT}?userIdentifier=${
        req.query.userIdentifier
      }&participant=${req.session?.userParticipant.id}${
        req.query.privacyNoticeId
          ? `&privacyNoticeId=${req.query.privacyNoticeId}`
          : ""
      }`
    );
  } else {
    res.json({
      message: "No PDI endpoint setup.",
    });
  }
});

export default r;
