import { expect } from "chai";
import supertest from "supertest";
import { Application } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import { startServer } from "../server";
import { IncomingMessage, ServerResponse } from "http";
import * as http from "http";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import crypto from "crypto";
import nock from "nock";
import { setupnockMocks } from "./fixtures/mock";
// import { mockContracts, mockBilateralContracts } from "./fixtures/mockContract";
import {
  testProvider1,
  testConsumer1,
  testUser1,
} from "./fixtures/testAccount";

let serverInstance: {
  app: Application;
  server: http.Server<typeof IncomingMessage, typeof ServerResponse>;
};
const mockAxios = new MockAdapter(axios);
let userId: string;
let userJwt: string;
let providerId: string;
let consumerId: string;
let selfDesc_consumerId: string;
let selfDesc_providerId: string;

let providerUserIdentifier: string;
let consumerUserIdentifier: string;
let providerJWT: string;
let consumerJWT: string;
let providerBase64: string;
let consumerBase64: string;
let contractbase64: string;
let privacyNoticeId: string;
let consentId: string;
let consent: any;
let token: string;

// describe("Consent Routes Tests", function () {
//   before(async () => {
//     nock.cleanAll();

//     serverInstance = startServer(9090);
//     // Create Provider
//     const providerData = testProvider1;
//     const providerResponse = await supertest(serverInstance.app)
//       .post(`/v1/participants/`)
//       .send(providerData);
//     providerId = providerResponse.body._id;
//     selfDesc_providerId = providerData.selfDescriptionURL;

//     // Login provider
//     const providerAuthResponse = await supertest(serverInstance.app)
//       .post(`/v1/participants/login`)
//       .send({
//         clientID: testProvider1.clientID,
//         clientSecret: testProvider1.clientSecret,
//       });
//     providerJWT = `Bearer ${providerAuthResponse.body.jwt}`;
//     providerBase64 = Buffer.from(providerData.selfDescriptionURL).toString(
//       "base64"
//     );

//     // Create Consumer
//     const consumerData = testConsumer1;
//     const consumerResponse = await supertest(serverInstance.app)
//       .post(`/v1/participants/`)
//       .send(consumerData);
//     consumerId = consumerResponse.body._id;
//     selfDesc_consumerId = consumerData.selfDescriptionURL;

//     // Login consumer
//     const consumerAuthResponse = await supertest(serverInstance.app)
//       .post(`/v1/participants/login`)
//       .send({
//         clientID: testConsumer1.clientID,
//         clientSecret: testConsumer1.clientSecret,
//       });
//     consumerJWT = `Bearer ${consumerAuthResponse.body.jwt}`;
//     consumerBase64 = Buffer.from(consumerData.selfDescriptionURL).toString(
//       "base64"
//     );

//     // Create User
//     const userData = testUser1;
//     const userResponse = await supertest(serverInstance.app)
//       .post(`/v1/users/signup`)
//       .send(userData);
//     userId = userResponse.body.user._id;
//     // Login user
//     const userAuthresponse = await supertest(serverInstance.app)
//       .post(`/v1/users/login`)
//       .send({
//         email: testUser1.email,
//         password: testUser1.password,
//       });
//     userJwt = `Bearer ${userAuthresponse.body.accessToken}`;
//     // Create UserIdentifier Provider
//     const providerUserIdentifierResponse = await supertest(serverInstance.app)
//       .post(`/v1/users/register`)
//       .set("Authorization", providerJWT)
//       .send({
//         email: testUser1.email,
//         identifier: "providerUserIdentifier1",
//       });
//     providerUserIdentifier = providerUserIdentifierResponse.body._id;

//     // Create UserIdentifier Consumer
//     const consumerUserIdentifierResponse = await supertest(serverInstance.app)
//       .post(`/v1/users/register`)
//       .set("Authorization", consumerJWT)
//       .send({
//         email: testUser1.email,
//         identifier: "consumerUserIdentifier1",
//       });
//     consumerUserIdentifier = consumerUserIdentifierResponse.body._id;
//   });

//   after(async () => {
//     serverInstance.server.close();
//   });

//   // //getAvailableExchanges
//   // it("should get available exchanges", async () => {
//   //   setupnockMocks(providerBase64);
//   //   const response = await supertest(serverInstance.app)
//   //     .get(`/v1/consents/exchanges/as?as=provider`)
//   //     .set("Authorization", providerJWT);
//   //   expect(response.status).to.be.equal(200);
//   //   expect(response.body).to.have.property("participant");
//   //   expect(response.body).to.have.property("exchanges");
//   //   expect(response.body.participant).to.have.property("selfDescription");
//   //   expect(response.body.participant).to.have.property(
//   //     "base64SelfDescription"
//   //   );
//   // });

//   //getPrivacyNotices
//   it("should get the privacy notices", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/${userId}/${providerBase64}/${consumerBase64}`)
//       .set("x-user-key", providerUserIdentifier);
//     privacyNoticeId = response.body[0]?._id;
//     console.log("Privacy Notice ID:", privacyNoticeId);
//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.not.be.empty;
//     expect(response.body[0]).to.have.property("_id");
//     expect(response.body[0]).to.have.property(
//       "dataProvider",
//       "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2b"
//     );
//     expect(response.body[0]).to.have.property(
//       "contract",
//       "http://localhost:8888/contracts/65e5d715c99e484e4685a964"
//     );
//   });

//   //getPrivacyNoticeById
//   it("should get a privacy notice by id", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/privacy-notices/${privacyNoticeId}`)
//       .set("x-user-key", providerUserIdentifier);
//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.not.be.empty;
//     expect(response.body).to.have.property("_id");
//     expect(response.body).to.have.property("contract");
//     expect(response.body.dataProvider._id).to.equal(providerId);
//   });

//   ///giveConsent
//   it("should give consent", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .post(`/v1/consents`)
//       .set("x-user-key", providerUserIdentifier)
//       .send({
//         privacyNoticeId: privacyNoticeId,
//       });
//     consentId = response.body._id;
//     expect(response.status).to.be.equal(201);
//     expect(response.body.user).to.equal(userId);
//     expect(response.body.providerUserIdentifier).to.equal(
//       providerUserIdentifier
//     );
//     expect(response.body.consumerUserIdentifier).to.equal(
//       providerUserIdentifier
//     );
//     expect(response.body.consented).to.equal(true);
//     expect(response.body.dataProvider).to.equal(providerId);
//     expect(response.body.dataConsumer).to.equal(consumerId);
//     expect(response.body.privacyNotice).to.equal(privacyNoticeId);
//     expect(response.body.status).to.equal("granted");
//   });

//   //resume consent
//   it("resumeConsent", async () => {
//     setupnockMocks(providerBase64);
//     //TODO //nock PDI_ENDPOINT + nock contract endpoint
//     const response = await supertest(serverInstance.app)
//       .post(`v1/consents/${consentId}/resume`)
//       .send({
//         internalID: providerUserIdentifier,
//         email: testUser1.email,
//       })
//       .set("Authorization", providerJWT)
//       .expect(200);
//   });

//   //trigger data exchange
//   it("should triggerDataExchange", async () => {
//     setupnockMocks(providerBase64);
//     mockAxios
//       .onPost("https://test.consent/consent/export")
//       .reply(200, { message: "ok" });
//     const response = await supertest(serverInstance.app)
//       .post(`/v1/consents/${consentId}/data-exchange`)
//       .set("x-user-key", providerUserIdentifier);
//     consent = response.body.consent;
//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property(
//       "message",
//       "successfully sent consent to the provider's consent export endpoint to trigger the data exchange"
//     );
//   });

//   //delete consent
//   it("deleteConsentUser", async () => {
//     setupnockMocks(providerBase64);
//     //TODO //nock PDI_ENDPOINT + nock contract endpoint
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/${consentId}`)
//       .send({ privacyNoticeId: privacyNoticeId })
//       .set("x-user-key", providerUserIdentifier)
//       .expect(200);
//   });

//   //giveConsentOnEmailValidation +delete

//   //revoke consent
//   it("should revoke consent", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .delete(`/v1/consents/${consentId}`)
//       .set("x-user-key", providerUserIdentifier)
//       .expect(200);
//     expect(response.body.status).to.equal("revoked");
//   });

//   //generate pdi-iframe
//   it("generate pdi-iframe", async () => {
//     setupnockMocks(providerBase64);
//     //TODO //nock PDI_ENDPOINT
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/pdi/iframe`)
//       // `/v1/consents/iframe?pdiURL=https%3A%2F%2Fapi.preprod.trustedauthority.io%2Fv1%2Fparticipants%2F6484ffaf86e33f792f17d112`
//       .set("Authorization", providerJWT)
//       .expect(200);
//     expect(response.headers["content-type"]).to.include("text/html");
//   });

//   //generate pdi-iframe
//   it("generate pdi-iframe by privacy notice Id", async () => {
//     setupnockMocks(providerBase64);
//     //TODO //nock PDI_ENDPOINT
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/pdi/iframe`)
//       // `/v1/consents/iframe?pdiURL=https%3A%2F%2Fapi.preprod.trustedauthority.io%2Fv1%2Fparticipants%2F6484ffaf86e33f792f17d112`
//       .set("Authorization", providerJWT)
//       .query({
//         userIdentifier: providerUserIdentifier,
//         privacyNoticeId: privacyNoticeId,
//       })
//       .expect(200);
//     expect(response.headers["content-type"]).to.include("text/html");
//   });

//   // user endpoints
//   // getUserAvailableExchanges
//   it("getUserAvailableExchanges", async () => {
//     setupnockMocks(providerBase64);
//     // TODO: nock PDI_ENDPOINT + nock contract endpoint
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/exchanges/user`)
//       .set("Authorization", userJwt)
//       .query({ participantId: providerId })
//       .expect(200);

//     contractbase64 = response.body.exchanges[0].contractbase64;
//     expect(response.body.participant.selfDescription).to.equal(
//       selfDesc_providerId
//     );
//     expect(response.body.exchanges).to.not.be.empty;
//     expect(response.body.exchanges[0].participantSelfDescription).to.equal(
//       selfDesc_consumerId
//     );
//   });

//   // getUserPrivacyNoticesByContract
//   it("getUserPrivacyNoticesByContract", async () => {
//     setupnockMocks(providerBase64);
//     // TODO: nock PDI_ENDPOINT + nock contract endpoint
//     const response = await supertest(serverInstance.app)
//       .get(
//         `/v1/consents/${providerUserIdentifier}/${providerBase64}/${consumerBase64}/${contractbase64}`
//       )
//       .set("Authorization", userJwt)
//       .expect(200);

//     expect(response.body[0].dataProvider).to.equal(selfDesc_providerId);
//     expect(response.body[0].recipients).to.deep.include(selfDesc_consumerId);
//   });

//   // getUserPrivacyNoticeById
//   it("getUserPrivacyNoticeById", async () => {
//     setupnockMocks(providerBase64);
//     // TODO: nock PDI_ENDPOINT + nock contract endpoint
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents//privacy-notices/${privacyNoticeId}/user`)
//       .set("Authorization", userJwt)
//       .expect(200);

//     expect(response.body[0].dataProvider).to.equal(selfDesc_providerId);
//     expect(response.body[0].recipients).to.deep.include(selfDesc_consumerId);
//   });

//   // giveConsentUser
//   it("giveConsentUser", async () => {
//     setupnockMocks(providerBase64);
//     // TODO: nock PDI_ENDPOINT + nock contract endpoint
//     const response = await supertest(serverInstance.app)
//       .get(`v1/consents/user`)
//       .send({ privacyNoticeId: privacyNoticeId })
//       .set("Authorization", userJwt)
//       .expect(200);

//     response.body._id = consentId;
//     expect(response.body).to.have.property("contract");
//     expect(response.body.dataProvider._id).to.equal(providerId);
//   });

//   // getUserConsents +
//   it("should getUserConsents - by user", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/me`)
//       .set("x-user-key", providerUserIdentifier);

//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property("consents");
//   });

//   it("should getUserConsents - by participant", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/participants/:userId/`)
//       .set("Authorization", providerJWT);

//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property("consents");
//   });

//   // getUserConsentById
//   it("should getUserConsentById - by user", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/me/:id`)
//       .set("x-user-key", providerUserIdentifier);

//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property("consents");
//   });

//   it("should getUserConsentById - by participant", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .get(`/v1/consents/participants/:userId/:id`)
//       .set("Authorization", providerJWT);

//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property("consents");
//   });

//   it("should attach token to consent", async () => {
//     setupnockMocks(providerBase64);
//     mockAxios
//       .onPost("https://test.consent/consent/import")
//       .reply(200, { message: "ok" });

//     token = crypto.randomUUID();

//     const response = await supertest(serverInstance.app)
//       .post(`/v1/consents/${consentId}/token`)
//       .set("Authorization", providerJWT)
//       .send({
//         token,
//         providerDataExchangeId: "6601aa0cc344579ca63aeb9b",
//       });

//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property(
//       "message",
//       "successfully forwarded consent to the data consumer"
//     );
//   });

//   it("should validate the consent", async () => {
//     setupnockMocks(providerBase64);
//     const response = await supertest(serverInstance.app)
//       .post(`/v1/consents/${consentId}/validate`)
//       .set("Authorization", providerJWT)
//       .send({ token });

//     expect(response.status).to.be.equal(200);
//     expect(response.body).to.have.property(
//       "message",
//       "token matches consent token"
//     );
//     expect(response.body).to.have.property("verified", true);
//   });

//   describe("Test error", () => {
//     it("should not getUserConsents with no authorization", async () => {
//       const response = await supertest(serverInstance.app)
//         .get(`/v1/consents/me`)
//         .expect(401);

//       expect(response.body).to.have.property(
//         "message",
//         "Authorization header missing or invalid"
//       );
//     });

//     // revokeConsent
//     it("should fail to revoke non existent consent", async () => {
//       const response = await supertest(serverInstance.app)
//         .delete(`/v1/consents/${consentId}`)
//         .set("x-user-key", providerUserIdentifier)
//         .expect(404);

//       expect(response.body.error).to.equal("Consent not found");
//     });
//     // trigger dataExchang
//     it("should not trigger data exchange for a non-existent consent", async () => {
//       const response = await supertest(serverInstance.app)
//         .post(`/v1/consents/6601a6265cbdad603e4e9a8c/data-exchange`)
//         .set("x-user-key", providerUserIdentifier)
//         .send({ privacyNoticeId: privacyNoticeId });

//       expect(response.status).to.be.equal(404);
//       expect(response.body).to.have.property("error", "consent not found");
//     });
//     // generate iframe
//     it("should respond with JSON message if no PDI endpoint setup", async () => {
//       const response = await supertest(serverInstance.app)
//         .get(`v1/consents/pdi/iframe`)
//         .set("Authorization", providerJWT)
//         .query({
//           userIdentifier: providerUserIdentifier,
//           privacyNoticeId: privacyNoticeId,
//         })
//         .expect(200); // à vérifier

//       expect(response.body.message).to.equal("No PDI endpoint setup.");
//     });
//   });
// });
