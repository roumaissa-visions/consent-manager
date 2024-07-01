import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";
const instance = Axios.create();
const axios = setupCache(instance);

export const populatePrivacyNotice = async (response: any) => {
  const [contractResp, dataProviderResp] = await Promise.all([
    axios.get(response?.contract),
    response?.dataProvider.includes("http")
      ? axios.get(response?.dataProvider)
      : null,
  ]);

  const [...dataResponses] = await Promise.all([
    /* eslint-disable-next-line no-unsafe-optional-chaining */
    ...response?.data.map(async (dt: { resource: string }) => {
      const response = await axios.get(dt.resource);
      response.data.resource = dt.resource;
      return response;
    }),
  ]);

  const [...recipientsResponses] = await Promise.all([
    /* eslint-disable-next-line no-unsafe-optional-chaining */
    ...response?.recipients.map((dt: string) => axios.get(dt)),
  ]);

  const [...purposeResponses] = await Promise.all([
    /* eslint-disable-next-line no-unsafe-optional-chaining */
    ...response?.purposes.map(async (purpose: { resource: string }) => {
      const response = await axios.get(purpose?.resource);
      response.data.resource = purpose?.resource;
      return response;
    }),
  ]);

  const dataResponsesMap = dataResponses?.map((dt: { data: any }) => dt?.data);
  const purposeResponsesMap = purposeResponses?.map(
    (dt: { data: any }) => dt?.data
  );
  const recipientsResponsesMap = recipientsResponses?.map(
    (dt: { data: any }) => dt?.data
  );

  // await Promise.all(
  //     dataResponsesMap.map(async (data: any) => {
  //         const [...dataResourceResponses] = await Promise.all([
  //             ...data?.dataResources.map((resource: string) => axios.get(resource))
  //         ])
  //         data.dataResources = dataResourceResponses?.map((dt: {data: any}) => dt?.data);
  //         return data;
  //     }));
  //
  // await Promise.all(
  //     purposeResponsesMap.map(async (data: any) => {
  //         const [...softwareResourceResponses] = await Promise.all([
  //             ...data?.softwareResources.map((resource: string) => axios.get(resource))
  //         ])
  //         data.softwareResources = softwareResourceResponses?.map((dt: {data: any}) => dt?.data);
  //         return data;
  //     }));

  if (contractResp && contractResp.status === 200 && contractResp.data)
    response.contract = contractResp.data;
  if (
    dataProviderResp &&
    dataProviderResp.status === 200 &&
    dataProviderResp.data
  )
    response.dataProvider = dataProviderResp.data;
  if (dataResponses && dataResponsesMap.length > 0)
    response.data = dataResponsesMap;
  if (recipientsResponses && recipientsResponsesMap.length > 0)
    response.recipients = recipientsResponsesMap;
  if (purposeResponses && purposeResponsesMap.length > 0)
    response.purposes = purposeResponsesMap;

  return response;
};
