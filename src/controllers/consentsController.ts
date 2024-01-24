import { NextFunction, Request, Response } from "express";
import Consent from "../models/Consent/Consent.model";
import { getPrivacyNoticesFromContractsBetweenParties } from "../utils/contracts";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";
import PrivacyNotice from "../models/PrivacyNotice/PrivacyNotice.model";
import UserIdentifier from "../models/UserIdentifier/UserIdentifier.model";
import User from "../models/User/User.model";
import { IPrivacyNotice, IUserIdentifier } from "../types/models";
import Participant from "../models/Participant/Participant.model";
import { NodemailerClient } from "../libs/emails/nodemailer";
import { Logger } from "../libs/loggers";
import axios from "axios";
import { createPrivateKey, privateEncrypt } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import crypto from "crypto";

const consentSignaturePrivateKey = readFileSync(
  path.join(__dirname, "..", "config", "keys", "consentSignature.pem")
);

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
 * Gets the privacy notices for a consent based on existing
 * contracts between two participants
 */
export const getPrivacyNotices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { providerId, consumerId } = req.body;

    const existingPrivacyNotices = await PrivacyNotice.find({
      dataProvider: providerId,
      recipients: { $in: consumerId },
    });

    const privacyNotices = await getPrivacyNoticesFromContractsBetweenParties(
      providerId,
      consumerId
    );

    if (!privacyNotices && !existingPrivacyNotices)
      return res.status(404).json({ error: "No contracts found" });

    // TODO existing privacy notices should be used if similar ones come
    // from the contracts analysis.

    const finalPrivacyNotices: IPrivacyNotice[] = []; // This is what will be sent back
    const filteredPrivacyNoticesComingFromContracts: IPrivacyNotice[] = []; // These are new and should be saved after the filtering

    // Find the privacy notices from the existing ones that are similar to the ones
    // coming from the contracts
    // If a similar one is found it should be used alongside the other existing
    // privacy notices in the final returned result.

    await Promise.all(
      filteredPrivacyNoticesComingFromContracts.map((pn) => {
        const newPn = new PrivacyNotice(pn);
        newPn.save();
        return newPn;
      })
    );

    return res.json(finalPrivacyNotices);
  } catch (err) {
    next(err);
  }
};

/**
 * Returns the privacy notice by ID
 * @author Felix Bole
 */
export const getPrivacyNoticeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pn = await PrivacyNotice.findById(req.params.privacyNoticeId);
    if (!pn) {
      return res.status(404).json({ error: "Privacy notice not found" });
    }

    return res.json(pn);
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
      user: userId,
    });
    if (!consent) throw new NotFoundError();

    res.json(consent);
  } catch (err) {
    next(err);
  }
};

const findMatchingUserIdentifier = async (
  email: string,
  participantId: string
) => {
  const userIdentifier = await UserIdentifier.findOne({
    email,
    attachedParticipant: participantId,
  });

  if (!userIdentifier) {
    throw new Error("User identifier not found");
  }

  return userIdentifier;
};

/**
 * Gives consent on a contractualised data exchange
 * This method is initiated by a call from the User
 * he must be authenticated to perform it
 */
export const giveConsent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "user unauthenticated" });

    const user = await User.findById(userId).populate<{
      identifiers: IUserIdentifier[];
    }>([{ path: "identifiers" }]);
    if (!user) return res.status(404).json({ error: "user not found" });

    const { privacyNoticeId, email, data } = req.body;
    if (!privacyNoticeId)
      throw new BadRequestError("Missing privacyNoticeId", [
        { field: "privacyNoticeId", message: "Mandatory field" },
      ]);

    const privacyNotice = await PrivacyNotice.findById(privacyNoticeId);
    if (!privacyNotice)
      return res.status(404).json({ error: "privacy notice not found" });

    // Raccomodate the SD URL to the internal participant ID
    // ? What if it comes from another consent service ?
    const dataProviderSD = privacyNotice.dataProvider;
    const dataProvider = await Participant.findOne({
      selfDescriptionURL: dataProviderSD,
    });
    const dataConsumerSD =
      privacyNotice.recipients.length > 0 ? privacyNotice.recipients[0] : null;
    const dataConsumer = await Participant.findOne({
      selfDescriptionURL: dataConsumerSD,
    });

    if (!dataConsumerSD)
      return res
        .status(404)
        .json({ error: "Data consumer not found in privacy notice" });

    // Find user identifiers
    const providerUserIdentifier = user.identifiers.find(
      (id) => id.attachedParticipant?.toString() === dataProvider?.id
    );
    const consumerUserIdentifier = user.identifiers.find(
      (id) => id.attachedParticipant?.toString() === dataConsumer?.id
    );

    if (!providerUserIdentifier) {
      return res
        .status(400)
        .json({ error: "User identifier does not exist in data provider" });
    }

    const consent = new Consent({
      privacyNotice: privacyNotice,
      user: req.user?.id,
      providerUserIdentifier,
      consumerUserIdentifier,
      dataProvider: dataProvider,
      recipients: privacyNotice.recipients,
      purposes: privacyNotice.purposes,
      data: data,
      status: "pending",
      consented: true,
    });

    // If user identifier in consumer was not found it is possible it exists
    // for another email. If it's the case, the user should provide the email
    // used in the consumer app and the consent service should validate the
    // consent grant by mail with the provided email.
    if (!consumerUserIdentifier) {
      if (!email)
        return res.status(400).json({
          error:
            "User identifier not found in provider and no email was passed in the payload to look for an existing identifier with a different user email. Please provide the email",
        });

      const existingUserIdentifier = await findMatchingUserIdentifier(
        email,
        dataConsumer?.id
      );

      if (!existingUserIdentifier) {
        return res.status(404).json({
          error: "No user identifier found in the consumer for email " + email,
        });
      } else {
        // User identifier found but not attached to the main user, requires user validation
        // by email to re-trigger the consent grant

        const validationURL = `${process.env.APP_ENDPOINT}/${
          process.env.API_PREFIX
        }/consents/emailverification?privacyNotice=${
          privacyNotice.id
        }&dataProvider=${dataProvider.id}&data=${JSON.stringify(data)}`;

        await NodemailerClient.sendMessageFromLocalTemplate(
          { to: email, subject: "Consent validation" },
          "consentValidation",
          { url: encodeURIComponent(validationURL) }
        );

        return res.status(200).json({
          message:
            "User identifier in consumer was found using provided email, an email has been sent for the user's provided email to validate his consent grant",
          case: "email-validation-requested",
        });
      }
    }

    await consent.save();

    res.status(200).json(consent);
  } catch (err) {
    next(err);
  }
};

/**
 * Gives consent on email validation from the user
 */
export const giveConsentOnEmailValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dataProvider, privacyNotice, data } = req.query;
    const decodedDP = decodeURIComponent(dataProvider.toString());
    const decodedPN = decodeURIComponent(privacyNotice.toString());
    const decodedData = decodeURIComponent(data.toString());
    const selectedData = JSON.parse(decodedData);

    const pn = await PrivacyNotice.findById(decodedPN);
    if (!pn) return res.status(404).json({ error: "privacy notice not found" });

    const dp = await Participant.findById(decodedDP);
    if (!dp) {
      return res.status(404).json({ error: "data provider not found" });
    }

    const consent = new Consent({
      privacyNotice: privacyNotice,
      user: req.user?.id,

      dataProvider: dataProvider,
      recipients: pn.recipients,
      purposes: pn.purposes,
      data: selectedData,
      status: "granted",
      consented: true,
    });
    await consent.save();
    return res.status(200).json({
      message: "Successfully granted consent. You may close this tab now",
    });
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

/**
 * Uses a given consent to trigger a data exchange
 */
export const triggerDataExchange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { consentId } = req.params;
    const consent = await Consent.findById(consentId);
    if (!consent) return res.status(404).json({ error: "consent not found" });

    if (consent.status !== "granted") {
      return res
        .status(401)
        .json({ error: "Consent has not been granted by user" });
    }

    const payload = {
      ...consent.toJSON(),
    };

    const privateKey = createPrivateKey(consentSignaturePrivateKey);
    const signedConsent = privateEncrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(JSON.stringify(payload))
    );

    // TODO find consent/export endpoint in data provider's self description
    // consent.dataProvider

    try {
      // TODO replace url
      await axios.post("TODO_ENDPOINT_CONSENT_EXPORT_OF_PROVIDER", {
        signedConsent,
      });
      return res.status(200).json({
        message:
          "successfully sent consent to the provider's consent export endpoint to trigger the data exchange",
        consent,
      });
    } catch (err) {
      Logger.error({
        location: "consents.triggerDataExchange",
        message: err.message,
      });
      return res.status(424).json({
        error: "Failed to communicate with the data consumer connector",
        message:
          "An error occured after calling the consent data exchange trigger endpoint of the consumer service",
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Verifies the provider generated token and attaches it to the consent
 * to be sent to the consumer
 */
export const attachTokenToConsent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, consentId } = req.body;
    const consent = await Consent.findById(consentId);
    if (!consent) return res.status(404).json({ error: "Consent not found" });

    consent.token = token;

    await consent.save();

    const payload = {
      ...consent.toJSON(),
    };

    const privateKey = createPrivateKey(consentSignaturePrivateKey);
    const signedConsent = privateEncrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(JSON.stringify(payload))
    );

    try {
      // TODO find data consumer endpoint "consent import"
      await axios.post(
        "TODO_ENDPOINT_CONSENT_IMPORT_CONSUMER",
        {
          dataProviderEndpoint: "", // TODO find data provider "data export" endpoint
          signedConsent,
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      Logger.error({ location: "consents.attachToken", message: err.message });
      return res.status(424).json({
        message: `an error occured after calling the data consumer's /consent/import endpoint`,
        data: {
          details: {
            errorMessage: err.message,
          },
        },
      });
    }

    return res
      .status(200)
      .json({ message: "successfully forwarded consent to the data consumer" });
  } catch (err) {
    next(err);
  }
};

/**
 * Verifies the token & consent validity
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { consentId, token } = req.body;
    const consent = await Consent.findById(consentId);
    if (!consent) return res.status(404).json({ error: "Consent not found" });
    const consentToken = consent.token;
    if (!consentToken || token !== consentToken)
      return res
        .status(400)
        .json({ error: "token does not match consent token" });

    return res.status(200).json({ message: "token matches consent token" });
  } catch (err) {
    next(err);
  }
};
