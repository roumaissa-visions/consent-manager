import axios from "axios";
import { randomUUID } from "crypto";
import { IConsent, IParticipant, IPrivacyNotice, IUser } from "../types/models";
import Consent from "../models/Consent/Consent.model";
import { NotFoundError } from "../errors/NotFoundError";
import { Purpose } from "../types";
import {
  bilateralContractToPrivacyNotice,
  ecosystemContractToPrivacyNotice,
} from "./privacyNotices";

type Permission = {
  action: string;
  target: string;
  constraing: any[];
};

type Member = {
  participant: string;
  role: string;
  signature: string;
  date: Date;
};

type Policy = {
  uid: string;
  description: string;
  permission: Permission[];
  prohibition: Permission[];
};

export type BilateralContract = {
  uid: string;
  dataProvider: string;
  dataConsumer: string;
  serviceOffering: string;
  profile: string;
  policy: Policy[];
  purpose: any[];
  signatures: any[];
  revokedSignatures: any[];
  negotiators: { did: string }[];
  status: "signed" | "revoked" | "under_negotiation" | "pending";
  terminationAndValidity: {
    effectiveDate: Date;
    terminationPeriod: Date;
  };
  limitationOfLiability: Date;
  termsAndConditions: string;
  jsonLD: string;
};

export type EcosystemContract = {
  uid: string;
  profile: string;
  ecosystem: string;
  orchestrator: string;
  serviceOfferings: {
    participant: string;
    serviceOffering: string;
    policies: Policy[];
  }[];
  rolesAndObligations: {
    role: string;
    policies: Policy[];
  };
  purpose: Purpose[];
  members: Member[];
  revokedMembers: Member[];
  status: "signed" | "revoked" | "pending";
  jsonLD: string;
};

export const getDataFromPliciesInBilateralContract = (
  contract: BilateralContract
) => {
  const policiesMatchingServiceOffering = contract.policy.filter(
    (policy) =>
      policy.permission.find(
        (p) => p.target === (contract as BilateralContract)?.serviceOffering
      ) ||
      policy.prohibition.find(
        (p) => p.target === (contract as BilateralContract)?.serviceOffering
      )
  );

  const dataFromPermissions = policiesMatchingServiceOffering.map((policy) => {
    const result = policy.permission.map((permission) => permission.target);
    return result;
  });

  const dataFromProhibitions = policiesMatchingServiceOffering.map((policy) => {
    const result = policy.prohibition.map((prohibition) => prohibition.target);
    return result;
  });

  const combinedData = [...dataFromPermissions, ...dataFromProhibitions].reduce(
    (acc, curr) => acc.concat(curr),
    []
  );

  return combinedData;
};

/**
 * Looks for all of the targets from the service offerings inside of the ecosystem contract
 * If options is specified, will filter only the service offerings based on the specified participants
 *
 * Does not check for if the target is based off a data resource or software resource
 */
export const getDataFromPoliciesInEcosystemContract = (
  contract: EcosystemContract,
  dataProvider?: string
) => {
  const policies = dataProvider
    ? contract.serviceOfferings
        ?.filter((so) => so.participant === dataProvider)
        .map((so) => so.policies)
    : contract.serviceOfferings?.map((so) => so.policies);

  const combinedPolicies = [...policies].reduce((acc, curr) =>
    acc.concat(curr)
  );

  const filteredPolicies = combinedPolicies.filter(
    (policy) =>
      policy.permission.find((p) => p.target !== null) ||
      policy.prohibition.find((p) => p.target !== null)
  );

  const dataFromPermissions = filteredPolicies.map((policy) => {
    const result = policy.permission.map((permission) => permission.target);
    return result;
  });

  const dataFromProhibitions = filteredPolicies.map((policy) => {
    const result = policy.prohibition.map((prohibition) => prohibition.target);
    return result;
  });

  const combinedData = [...dataFromPermissions, ...dataFromProhibitions].reduce(
    (acc, curr) => acc.concat(curr),
    []
  );

  return combinedData;
};

export const getParticipantIdentifier = (participant: IParticipant) => {
  if (!participant) throw new NotFoundError("Participant not found");
  const consentManager = JSON.parse(participant.jsonld)?.consentManager;
  if (!consentManager)
    throw new NotFoundError(
      `Participant ${participant.legalName} has no consentManager information`
    );

  return encodeURIComponent(
    `${consentManager.solution}${consentManager.idInSolution}`
  );
};

export const getPrivacyNoticesFromContractsBetweenParties = async (
  dataProviderID: string,
  dataConsumerID: string
): Promise<IPrivacyNotice[]> => {
  const bilateralContractURL = `${process.env.CONTRACT_SERVICE_BASE_URL}/bilaterals/for/${dataProviderID}?hasSigned=true&isParticipant=false`;
  const ecosystemContractURL = `${process.env.CONTRACT_SERVICE_BASE_URL}/contracts/for/${dataProviderID}?hasSigned=true&isParticipant=false`;

  const [
    bilateralContractsRes,
    ecosystemContractsRes,
    dataProviderSDResponse,
    dataConsumerSDResponse,
  ] = await Promise.all([
    axios.get(bilateralContractURL, {
      headers: { "Content-Type": "application/json" },
    }),
    axios.get(ecosystemContractURL, {
      headers: { "Content-Type": "application/json" },
    }),
    dataProviderID.startsWith("http")
      ? axios.get(dataProviderID)
      : dataProviderID,
    dataConsumerID.startsWith("http")
      ? axios.get(dataConsumerID)
      : dataConsumerID,
  ]);

  const dataProviderSD =
    typeof dataProviderSDResponse !== "string"
      ? dataProviderSDResponse.data
      : dataProviderID;
  const dataConsumerSD =
    typeof dataConsumerSDResponse !== "string"
      ? dataConsumerSDResponse.data
      : dataConsumerID;

  const bilateralPrivacyNotices = bilateralContractsRes.data.map(
    (contract: BilateralContract) => bilateralContractToPrivacyNotice(contract)
  );

  const ecosystemPrivacyNotices = await Promise.all(
    ecosystemContractsRes.data.map(async (contract: EcosystemContract) => {
      // Populate the Privacy Notice
      const pn = ecosystemContractToPrivacyNotice(contract);
      const consumerServiceOfferings = contract.serviceOfferings.filter(
        (so) => so.participant === dataConsumerID
      );

      const consumerSOsThatArePurposes = await Promise.all(
        consumerServiceOfferings.map(async (so) => {
          if (so.serviceOffering.startsWith("http")) {
            const soSelfDescription = await axios.get(so.serviceOffering);
            if (soSelfDescription.data?.softwareResources?.length > 0)
              return so;
          }
          return null;
        })
      );

      const filteredConsumerSOs = consumerSOsThatArePurposes.filter(
        (so) => so !== null
      );

      pn.dataProvider = dataProviderID;

      pn.controllerDetails.name =
        typeof dataProviderSD === "string"
          ? dataProviderSD
          : dataProviderSD?.legalName;

      pn.data = getDataFromPoliciesInEcosystemContract(
        contract,
        dataProviderID
      );

      pn.purposes = filteredConsumerSOs.map((so) => ({
        purpose: so.serviceOffering,
        legalBasis: "",
      }));

      pn.recipients.push(
        typeof dataConsumerSD === "string"
          ? dataConsumerSD
          : dataConsumerSD?.legalName
      );

      return pn;
    })
  );

  return [...bilateralPrivacyNotices, ...ecosystemPrivacyNotices];
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
