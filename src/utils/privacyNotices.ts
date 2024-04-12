import { IPrivacyNotice } from "../types/models";
import {
  BilateralContract,
  EcosystemContract,
  getDataFromPoliciesInBilateralContract,
  getPurposeFromBilateralContract,
} from "./contracts";

export const bilateralContractToPrivacyNotice = async (
  contract: BilateralContract
): Promise<IPrivacyNotice> => {
  return {
    contract: `${process.env.CONTRACT_SERVICE_BASE_URL}/bilaterals/${contract._id}`,
    title: contract.profile,
    lastUpdated: Date.now().toString(),
    dataProvider: contract.dataProvider,
    controllerDetails: {
      name: contract.dataProvider,
      contact: "",
      representative: "",
      dpo: {
        name: "",
        contact: "",
      },
    },
    purposes: await getPurposeFromBilateralContract(contract),
    data: await getDataFromPoliciesInBilateralContract(contract),
    categoriesOfData: [],
    recipients: [contract.dataConsumer],
    internationalTransfers: {
      countries: [],
      safeguards: "",
    },
    retentionPeriod: "",
    piiPrincipalRights: [],
    withdrawalOfConsent: "",
    complaintRights: "",
    provisionRequirements: "",
    automatedDecisionMaking: {
      details: "",
    },
  };
};

/**
 * Builds a very generic and pretty empty privacy notice from a ecosystem
 * contract, that needs to be filled in with info after reception as the data
 * and purpose can only be decided when the service offerings of the provider
 * and consumer are known
 */
export const ecosystemContractToPrivacyNotice = (
  contract: EcosystemContract
) => {
  const privacyNotice: IPrivacyNotice = {
    contract: `${process.env.CONTRACT_SERVICE_BASE_URL}/contracts/${contract._id}`,
    title: contract.profile,
    lastUpdated: Date.now().toString(),
    dataProvider: "",
    controllerDetails: {
      name: "",
      contact: "",
      representative: "",
      dpo: {
        name: "",
        contact: "",
      },
    },
    purposes: contract.purpose.map((p) => ({
      serviceOffering: p?.serviceOffering,
      resource: p?.resource,
      legalBasis: "",
    })),
    data: [],
    categoriesOfData: [],
    recipients: [],
    internationalTransfers: {
      countries: [],
      safeguards: "",
    },
    retentionPeriod: "",
    piiPrincipalRights: [],
    withdrawalOfConsent: "",
    complaintRights: "",
    provisionRequirements: "",
    automatedDecisionMaking: {
      details: "",
    },
  };

  return privacyNotice;
};
