import { BilateralContract, EcosystemContract } from "./contracts";

export type IExchange = {
  contract: string;
  base64Contract?: string;
  participantSelfDescription: string;
  base64SelfDescription: string;
};

export const contractToExchange = (
  contract: BilateralContract | EcosystemContract,
  participantSD: string
): IExchange => {
  return {
    contract: `${process.env.CONTRACT_SERVICE_BASE_URL}/bilaterals/${contract._id}`,
    base64Contract: Buffer.from(
      `${process.env.CONTRACT_SERVICE_BASE_URL}/bilaterals/${contract._id}`
    ).toString("base64"),
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
    base64Contract: Buffer.from(
      `${process.env.CONTRACT_SERVICE_BASE_URL}/contracts/${contract._id}`
    ).toString("base64"),
    participantSelfDescription: participantSD,
    base64SelfDescription: Buffer.from(participantSD).toString("base64"),
  };
};
