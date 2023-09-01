import { NextFunction, Request, Response } from "express";
import Consent from "../models/Consent/Consent.model";
import { isValidObjectId } from "mongoose";
import { NotFoundError } from "../errors/NotFoundError";
import {
  getParticipantIdentifier,
  sendConsent,
  validate,
} from "../utils/contracts";
import Participant from "../models/Participant/Participant.model";
import UserIdentifier from "../models/UserIdentifier/UserIdentifier.model";

/**
 * Triggers a data exchange from a consent
 */
export const userTriggeredDataExchange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { consentId } = req.body;
    const userId = req.user.id;

    const query = isValidObjectId(consentId)
      ? { _id: consentId }
      : { identifier: consentId };

    const consent = await Consent.findOne({ ...query, user: userId });
    if (!consent) throw new NotFoundError("Consent not found");

    if (!consent.isValid()) {
      return res.status(403).json({ error: "Consent has not been granted" });
    }

    const { assignerID, assigneeID } = consent.getParticipantsIDs();

    // ID is at the end of the assigner/assignee url : http://url/ID
    // ? but how would it be handled if they come from different PDIs ?

    const [dataProvider, dataConsumer] = await Promise.all([
      Participant.findOne({
        assignerID,
      }),
      Participant.findOne({
        _id: assigneeID,
      }),
    ]);

    // Validate contract [simulated]
    const validateContract = await validate(
      getParticipantIdentifier(dataProvider),
      getParticipantIdentifier(dataConsumer)
    );
    if (validateContract.status !== 200) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid contract" });
    }

    // Communicate with EDC to trigger data exchange
    await sendConsent(consent.jsonData);

    // Feedback. This should include more information to display a nice
    // feedback UI to the user
    return res.json({
      success: true,
      message: "consent sent to data connector",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Triggers a push data exchange
 * Used by the Data Provider to activate a consent given by a user
 */
export const providerTriggeredDataExchange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { consentId, userId } = req.body;

    const userIdentifier = await UserIdentifier.findOne({
      attachedParticipant: req.userParticipant.id,
      _id: userId,
    });

    if (!userIdentifier) throw new NotFoundError("User Identifier not found");

    const query = isValidObjectId(consentId)
      ? { _id: consentId }
      : { identifier: consentId };

    const consent = await Consent.findOne({
      ...query,
      user: userIdentifier.user,
    });

    if (!consent) throw new NotFoundError("Consent not found");
    if (!consent.isValid()) {
      return res.status(403).json({ error: "Consent has not been granted" });
    }

    const { assignerID, assigneeID } = consent.getParticipantsIDs();

    const [dataProvider, dataConsumer] = await Promise.all([
      Participant.findOne({
        assignerID,
      }),
      Participant.findOne({
        _id: assigneeID,
      }),
    ]);

    // Validate contract [simulated]
    const validateContract = await validate(
      getParticipantIdentifier(dataProvider),
      getParticipantIdentifier(dataConsumer)
    );

    if (validateContract.status !== 200) {
      return res
        .status(403)
        .json({ success: false, error: "Invalid contract" });
    }

    // Communicate with EDC to trigger data exchange
    await sendConsent(consent.jsonData);

    // Feedback. This should include more information to display a nice
    // feedback UI to the user
    return res.json({
      success: true,
      message: "consent sent to data connector",
    });
  } catch (err) {
    next(err);
  }
};
