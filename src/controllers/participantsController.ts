import { Request, Response, NextFunction } from "express";
import Participant from "../models/Participant/Participant.model";
import { NotFoundError } from "../errors/NotFoundError";
import crypto from "crypto";
import { PARTICIPANT_SELECTION } from "../utils/schemaSelection";
import { issueJwt } from "../libs/jwt";

/**
 * Retrieves a participant by id
 */
export const getParticipantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participantId = req.params.id;
    const participant = await Participant.findById(participantId).select(
      PARTICIPANT_SELECTION
    );

    if (!participant) throw new NotFoundError("Participant not found");
    res.json(participant);
  } catch (err) {
    next(err);
  }
};

/**
 * Registers a new participant from a catalog
 * this should usually not be called by a individual participant
 * ? Should there be extra api key in here to only allow catalog instances ?
 */
export const registerParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participantData = req.body;
    const newParticipant = new Participant(participantData);

    // TODO
    newParticipant.jsonld = "";

    const selfDescriptionData = JSON.parse(newParticipant.jsonld);
    if (selfDescriptionData.endpoints) {
      const { dataExport, dataImport, consentImport, consentExport } =
        selfDescriptionData.endpoints;
      newParticipant.endpoints.dataExport = dataExport || "";
      newParticipant.endpoints.dataImport = dataImport || "";
      newParticipant.endpoints.consentImport = consentImport || "";
      newParticipant.endpoints.consentExport = consentExport || "";
    }

    const clientID = crypto.randomBytes(16).toString("hex");
    const clientSecret = crypto.randomBytes(32).toString("hex");

    newParticipant.clientID = clientID;
    newParticipant.clientSecret = clientSecret;

    const createdParticipant = await newParticipant.save();

    res.status(201).json(createdParticipant);
  } catch (err) {
    next(err);
  }
};

/**
 * Logs in the participant
 */
export const loginParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientID, clientSecret } = req.body;
    const participant = await Participant.findOne({ clientID, clientSecret });

    if (!participant) throw new NotFoundError("Participant not found");

    const jwt = issueJwt(participant);

    return res.json({
      success: true,
      jwt,
      message:
        "Successfully retrieved JWT for authenticating requests to the API",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves Participants. Uses pagination
 */
export const getAllParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit = "10", page = "1" } = req.query;

    const skip =
      (parseInt(page.toString()) - 1 >= 0 ? parseInt(page.toString()) - 1 : 0) *
      parseInt(limit.toString());

    const participants = await Participant.find()
      .skip(skip)
      .limit(parseInt(limit.toString()))
      .select(PARTICIPANT_SELECTION);

    const totalCount = await Participant.countDocuments();
    const totalPages = Math.ceil(totalCount / parseInt(limit.toString()));

    res.json({ participants, totalCount, totalPages });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the information of the logged in user
 * @author Felix Bole
 */
export const getMyParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const participant = await Participant.findById(req.userParticipant?.id);
    if (!participant) throw new NotFoundError("Participant not found");
    return res.json(participant);
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes the logged in participant
 * We are not handling the deletion of associated ecosystems and such
 * as we are only removing the local reference of the participant from
 * the consent manager pdi. The actual participant data resides still in
 * the catalog component
 */
export const deleteParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.userParticipant;
    const deletedParticipant = await Participant.findByIdAndDelete(id);
    if (!deletedParticipant) throw new NotFoundError("Participant not found");

    res.json({ message: "Participant deleted successfully" });
  } catch (err) {
    next(err);
  }
};
