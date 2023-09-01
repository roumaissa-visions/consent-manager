import { NextFunction, Request, Response } from "express";
import Consent from "../models/Consent/Consent.model";
import {
  buildConsentsFromContracts,
  getContractsBetweenParties,
  getParticipantIdentifier,
} from "../utils/contracts";
import { ThirdPartyError } from "../errors/ThirdPartyError";
import { NotFoundError } from "../errors/NotFoundError";
import { isObjectID } from "../middleware/objectIdFormatCheck";
import Participant from "../models/Participant/Participant.model";
import { USER_SELECTION } from "../utils/schemaSelection";
import User from "../models/User/User.model";
import { BadRequestError } from "../errors/BadRequestError";

/**
 * Gets the list of given consents of a user
 */
export const getUserConsents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const { limit = "10", page = "1" } = req.query;

    const skip = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    const consents = await Consent.find({ user: userId })
      .skip(skip)
      .limit(parseInt(limit.toString()));

    const totalCount = await Consent.countDocuments();

    const totalPages = Math.ceil(totalCount / parseInt(limit.toString()));

    res.json({ consents, totalCount, totalPages });
  } catch (err) {
    next(err);
  }
};

/**
 * Gets the consent of the specified ID from the user
 */
export const getUserConsentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const consent = await Consent.findOne({
      identifier: req.params.id,
      user: userId,
    });
    if (!consent) throw new NotFoundError();

    res.json(consent);
  } catch (err) {
    next(err);
  }
};

/**
 * Returns a payload with the consent information for the
 * end user to give consent on.
 * TODO We are assuming the contract model, this part can change
 */
export const getConsentReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const { dataProviderId, dataConsumerId } = req.params;
    isObjectID(dataProviderId, "dataProviderId");
    isObjectID(dataConsumerId, "dataConsumerId");

    const [dataProvider, dataConsumer] = await Promise.all([
      Participant.findById(dataProviderId),
      Participant.findById(dataConsumerId),
    ]);

    const contractsResponse = await getContractsBetweenParties(
      getParticipantIdentifier(dataProvider),
      getParticipantIdentifier(dataConsumer)
    );

    if (contractsResponse.status !== 200)
      throw new ThirdPartyError(
        "Contract service failed to find valid contracts"
      );

    // Build consent format from contracts
    const consentsFromContracts = await buildConsentsFromContracts(
      contractsResponse.data,
      await User.findById(userId).select(USER_SELECTION)
    );

    res.status(200).json(consentsFromContracts);
  } catch (err) {
    next(err);
  }
};

/**
 * Gives consent on a contractualised data exchange
 */
export const giveConsent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { consentId } = req.body;
    if (!consentId)
      throw new BadRequestError("Missing consentId", [
        { field: "consentId", message: "Mandatory field" },
      ]);

    const consent = await Consent.findOne({
      user: req.user.id,
      identifier: consentId,
    });
    if (!consent) throw new NotFoundError("Consent not found");

    consent.consented = true;
    consent.status = "granted";
    await consent.save();

    res.status(200).json(consent);
  } catch (err) {
    next(err);
  }
};

/**
 * Revoke consent
 */
export const revokeConsent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const consent = await Consent.findOne({
      user: req.user.id,
      identifier: id,
    });
    if (!consent) throw new NotFoundError("Consent not found");

    consent.consented = false;
    consent.status = "revoked";
    await consent.save();

    res.status(200).json(consent);
  } catch (err) {
    next(err);
  }
};
