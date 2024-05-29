import { BilateralContract, EcosystemContract } from "./contracts";
import Axios from "axios";
import { Logger } from "../libs/loggers";
import { setupCache } from "axios-cache-interceptor";

export type IExchange = {
  contracts: any;
  consumer: any;
  contract: string;
  base64Contract?: string;
  participantSelfDescription: string;
  base64SelfDescription: string;
};

const instance = Axios.create();
const axios = setupCache(instance, {
  ttl: 1000 * 60, // Default TTL: 1 minute
  methods: ["get"], // Cache GET requests
  cachePredicate: {
    statusCheck: (status) => status === 200,
  },
  // debug: (msg) => console.log(msg)
});

const fetchDataWithCache = async (url: string, cacheId: string) => {
  try {
    if (typeof url === "string" && url.includes("http")) {
      const response = await axios.get(url, {
        id: cacheId,
        cache: {
          ttl: 1000 * 60, // 1 minute TTL for this request
        },
      });
      return response.data;
    } else {
      return url;
    }
  } catch (err) {
    Logger.error({
      message: JSON.stringify(err, null, 2),
      location: `${url} - fetchDataWithCache`,
    });
  }
};

export const contractToExchange = async (
  contract: BilateralContract | EcosystemContract,
  participantSD: string
): Promise<IExchange> => {
  try {
    const contractUrl = `${process.env.CONTRACT_SERVICE_BASE_URL}/bilaterals/${contract._id}`;
    const contractData = await fetchDataWithCache(contractUrl, contractUrl);

    const consumerData = await fetchDataWithCache(participantSD, participantSD);

    const dataProviderUrl = contractData?.dataProvider;
    contractData.dataProvider = await fetchDataWithCache(
      dataProviderUrl,
      dataProviderUrl
    );

    return {
      contracts: contractData,
      contract: contractUrl,
      consumer: consumerData,
      base64Contract: Buffer.from(contractUrl).toString("base64"),
      participantSelfDescription: participantSD,
      base64SelfDescription: Buffer.from(participantSD).toString("base64"),
    };
  } catch (err) {
    Logger.error({
      message: JSON.stringify(err, null, 2),
      location: "contractToExchange",
    });
  }
};

export const contractEcosystemToExchange = async (
  contract: BilateralContract | EcosystemContract,
  participantSD: string
): Promise<IExchange> => {
  try {
    const contractUrl = `${process.env.CONTRACT_SERVICE_BASE_URL}/contracts/${contract._id}`;
    const contractData = await fetchDataWithCache(contractUrl, contractUrl);

    const consumerData = await fetchDataWithCache(participantSD, participantSD);

    const ecosystemUrl = contractData?.ecosystem;
    contractData.ecosystem = await fetchDataWithCache(
      ecosystemUrl,
      ecosystemUrl
    );

    return {
      contracts: contractData,
      contract: contractUrl,
      consumer: consumerData ?? participantSD,
      base64Contract: Buffer.from(contractUrl).toString("base64"),
      participantSelfDescription: participantSD,
      base64SelfDescription: Buffer.from(participantSD).toString("base64"),
    };
  } catch (err) {
    Logger.error({
      message: JSON.stringify(err, null, 2),
      location: "contractEcosystemToExchange",
    });
  }
};
