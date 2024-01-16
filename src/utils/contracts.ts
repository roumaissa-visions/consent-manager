import axios from "axios";
import { randomUUID } from "crypto";
import { IConsent, IParticipant, IUser } from "../types/models";
import Consent from "../models/Consent/Consent.model";
import { NotFoundError } from "../errors/NotFoundError";

export const getParticipantIdentifier = (participant: IParticipant) => {
  if (!participant) throw new NotFoundError("Participant not found");
  const consentManager = JSON.parse(participant.jsonld)?.consentManager;
  if (!consentManager)
    throw new NotFoundError(
      `Participant ${participant.hasLegallyBindingName} has no consentManager information`
    );

  return encodeURIComponent(
    `${consentManager.solution}${consentManager.idInSolution}`
  );
};

export const getContractsBetweenParties = async (
  dataProviderID: string,
  dataConsumerID: string
) => {
  const contractURL = `${process.env.CONTRACT_SERVICE_BASE_URL}/contracts/${dataProviderID}/${dataConsumerID}`;
  const res = await axios.get(contractURL, {
    headers: { "Content-Type": "application/json" },
  });
  return res;
};

export const validate = async (
  dataProviderID: string,
  dataConsumerID: string
) => {
  const contractURL = `${process.env.CONTRACT_SERVICE_BASE_URL}/verify/${dataProviderID}/${dataConsumerID}`;
  const res = await axios.get(contractURL, {
    headers: { "Content-Type": "application/json" },
  });
  return res;
};

// TODO This is to be reviewed once the contract model has been set
export const buildConsentsFromContracts = async (
  contracts: any[],
  user: IUser
) => {
  const consents: any[] = [];
  const toSave: IConsent[] = [];

  contracts.forEach((contract) => {
    const consentId = randomUUID();
    const consent: any = {
      version: "KI-CR-v1.1.O",
      consentReceiptID: consentId,
      collectionMethod: "", // Is this how the user gave consent ?
      jurisdiction: contract?.jurisdiction || "", // Is this dc:coverage ?
      consentTimestamp: null, // Until given by the user
      publicKey: "", // What is it ? How to get it ?
      language: contract?.language || "", // Unsure
      piiPrincipalId: `${user.firstName} ${user.lastName}`,
      piiControllers: [
        {
          id: process.env.FEDERATED_APPLICATION_IDENTIFIER,
          name: process.env.APPLICATION_NAME,
        },
      ], // Unsure but could be the PDI
      policyUrl: contract?.policyUrl || "",
      data: contract.data, // This property does not exist on the Kantara Consent Receipt
      services: [],
      sensitive: true, // How can we establish ?
      spiCat: contract?.spiCat,
      contract: contract.uri,
    };

    consent.services.push(
      contract.purpose.map((purpose: any) => {
        return {
          service: purpose.purpose,
          purposes: [{ ...purpose }],
        };
      })
    );

    consents.push(consent);

    // Save current stage of the consent to be able to compare
    // it later when the user grants consent
    const savedConsent = new Consent();
    savedConsent.user = user.id;
    savedConsent.identifier = consentId;
    savedConsent.userIdentifiers = user.identifiers;
    savedConsent.consented = false;
    const purposes: string[] = [];
    consent.services.forEach((s: any) => {
      if (s?.purposes?.length) {
        purposes.push(...s.purposes.map((p: any) => p.purpose));
      }
    });
    savedConsent.purposes = purposes.map((purpose) => ({
      legalBasis: "",
      purpose: purpose,
    }));
    savedConsent.data = consent.data.map((data: any) => JSON.stringify(data));
    savedConsent.jsonld = JSON.stringify(consent);
    savedConsent.status = "pending";
    toSave.push(savedConsent);
  });

  await Consent.insertMany(toSave);

  return consents;
};

export const sendConsent = async (consentSD: any) => {
  const res = await axios.get("/");
  res.data = {
    success: true,
    consent: consentSD,
  };
};
