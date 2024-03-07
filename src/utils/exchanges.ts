import { BilateralContract, EcosystemContract } from "./contracts";

export type IExchange = {
  contract: string;
  participantSelfDescription: string;
  base64SelfDescription: string;
};

export const contractToExchange = (
  contract: BilateralContract | EcosystemContract,
  participantSD: string
): IExchange => {
  return {
    contract: `${process.env.CONTRACT_SERVICE_BASE_URL}/bilaterals/${contract._id}`,
    participantSelfDescription: participantSD,
    base64SelfDescription: Buffer.from(participantSD).toString("base64"),
  };
};

export const contractEcosystemToExchange = (
  contract: BilateralContract | EcosystemContract,
  participantSD: string
): IExchange => {
  return {
    contract: `${process.env.CONTRACT_SERVICE_BASE_URL}/contracts/${contract._id}`,
    participantSelfDescription: participantSD,
    base64SelfDescription: Buffer.from(participantSD).toString("base64"),
  };
};
