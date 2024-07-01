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
import {
  testProvider1,
  testConsumer1,
  testUser1,
} from "./fixtures/testAccount";

let serverInstance: {
  app: Application;
  server: http.Server<typeof IncomingMessage, typeof ServerResponse>;
};
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
const token = crypto.randomUUID();

describe("Consent Routes Tests", function () {
  before(async () => {
    nock.cleanAll();

    serverInstance = startServer(9090);
    // Create Provider
    const providerData = testProvider1;
    const providerResponse = await supertest(serverInstance.app)
      .post(`/v1/participants/`)
      .send(providerData);
    providerId = providerResponse.body._id;
    selfDesc_providerId = providerData.selfDescriptionURL;

    // Login provider
    const providerAuthResponse = await supertest(serverInstance.app)
      .post(`/v1/participants/login`)
      .send({
        clientID: testProvider1.clientID,
        clientSecret: testProvider1.clientSecret,
      });
    providerJWT = `Bearer ${providerAuthResponse.body.jwt}`;
    providerBase64 = Buffer.from(providerData.selfDescriptionURL).toString(
      "base64"
    );

    // Create Consumer
    const consumerData = testConsumer1;
    const consumerResponse = await supertest(serverInstance.app)
      .post(`/v1/participants/`)
      .send(consumerData);
    consumerId = consumerResponse.body._id;
    selfDesc_consumerId = consumerData.selfDescriptionURL;

    // Login consumer
    const consumerAuthResponse = await supertest(serverInstance.app)
      .post(`/v1/participants/login`)
      .send({
        clientID: testConsumer1.clientID,
        clientSecret: testConsumer1.clientSecret,
      });
    consumerJWT = `Bearer ${consumerAuthResponse.body.jwt}`;
    consumerBase64 = Buffer.from(consumerData.selfDescriptionURL).toString(
      "base64"
    );

    // Create User
    const userData = testUser1;
    const userResponse = await supertest(serverInstance.app)
      .post(`/v1/users/signup`)
      .send(userData);
    userId = userResponse.body.user._id;
    // Login user
    const userAuthresponse = await supertest(serverInstance.app)
      .post(`/v1/users/login`)
      .send({
        email: testUser1.email,
        password: testUser1.password,
      });
    userJwt = `Bearer ${userAuthresponse.body.accessToken}`;
    // Create UserIdentifier Provider
    const providerUserIdentifierResponse = await supertest(serverInstance.app)
      .post(`/v1/users/register`)
      .set("Authorization", providerJWT)
      .send({
        email: testUser1.email,
        identifier: "providerUserIdentifier1",
      });
    providerUserIdentifier = providerUserIdentifierResponse.body._id;

    // Create UserIdentifier Consumer
    const consumerUserIdentifierResponse = await supertest(serverInstance.app)
      .post(`/v1/users/register`)
      .set("Authorization", consumerJWT)
      .send({
        email: testUser1.email,
        identifier: "consumerUserIdentifier1",
      });
    consumerUserIdentifier = consumerUserIdentifierResponse.body._id;
  });

  after(async () => {
    serverInstance.server.close();
  });

  // getAvailableExchanges
  it("should get available exchanges", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/exchanges/as?as=provider`)
      .set("Authorization", providerJWT);
    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.property("participant");
    expect(response.body).to.have.property("exchanges");
    expect(response.body.participant).to.have.property("selfDescription");
    expect(response.body.participant).to.have.property("base64SelfDescription");
  });

  // getPrivacyNotices
  it("should get the privacy notices", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/${userId}/${providerBase64}/${consumerBase64}`)
      .set("x-user-key", providerUserIdentifier);
    privacyNoticeId = response.body[0]?._id;
    expect(response.status).to.be.equal(200);
    expect(response.body).to.not.be.empty;
    expect(response.body[0]).to.have.property("_id");
    expect(response.body[0]).to.have.property(
      "dataProvider",
      "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2b"
    );
    expect(response.body[0]).to.have.property(
      "contract",
      "http://localhost:8888/contracts/65e5d715c99e484e4685a964"
    );
  });

  // getPrivacyNoticeById
  it("should get a privacy notice by id", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/privacy-notices/${privacyNoticeId}`)
      .set("x-user-key", providerUserIdentifier);
    expect(response.status).to.be.equal(200);
    expect(response.body).to.not.be.empty;
    expect(response.body).to.have.property("_id").and.to.equal(privacyNoticeId);
    expect(response.body).to.have.property("contract");
    expect(response.body.dataProvider._id).to.equal(testProvider1.identifier);
  });

  // giveConsent
  it("should give consent", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .post(`/v1/consents`)
      .set("x-user-key", providerUserIdentifier)
      .send({
        privacyNoticeId: privacyNoticeId,
      });
    consentId = response.body._id;
    expect(response.status).to.be.equal(201);
    // expect(response.body.user).to.equal(userId);
    expect(response.body.providerUserIdentifier).to.equal(
      providerUserIdentifier
    );
    expect(response.body.consumerUserIdentifier).to.equal(
      consumerUserIdentifier
    );
    expect(response.body.consented).to.equal(true);
    expect(response.body.dataProvider).to.equal(providerId);
    expect(response.body.dataConsumer).to.equal(consumerId);
    expect(response.body.privacyNotice).to.equal(privacyNoticeId);
    expect(response.body.status).to.equal("granted");
  });

  // // resume consent
  // it("resumeConsent", async () => {
  //   setupnockMocks(providerBase64);
  //   const response = await supertest(serverInstance.app)
  //     .post(`v1/consents/${consentId}/resume`)
  //     .send({
  //       internalID: providerUserIdentifier,
  //       email: testUser1.email,
  //     })
  //     .set("Authorization", providerJWT)
  //     .expect(200);
  // });

  // trigger data exchange
  it("should triggerDataExchange", async () => {
    // mocking export consent
    nock("https://test.consent").post("/consent/export").reply(200, {
      message: "ok",
      token,
      dataExchangeId: "5f6dd4e3495aebd3aca59529",
    });
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .post(`/v1/consents/${consentId}/data-exchange`)
      .set("x-user-key", providerUserIdentifier);
    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.property(
      "message",
      "successfully sent consent to the provider's consent export endpoint to trigger the data exchange"
    );
  });

  // revoke consent
  // it("should revoke consent", async () => {
  //   setupnockMocks(providerBase64);
  //   const response = await supertest(serverInstance.app)
  //     .delete(`/v1/consents/${consentId}`)
  //     .set("x-user-key", providerUserIdentifier)
  //     .expect(200);
  //   expect(response.body.status).to.equal("revoked");
  // });

  // generate pdi-iframe
  it("generate pdi-iframe", async () => {
    setupnockMocks(providerBase64);
    //TODO //nock PDI_ENDPOINT
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/pdi/iframe`)
      // `/v1/consents/iframe?pdiURL=https%3A%2F%2Fapi.preprod.trustedauthority.io%2Fv1%2Fparticipants%2F6484ffaf86e33f792f17d112`
      .set("Authorization", providerJWT)
      .expect(302);
  });

  // generate pdi-iframe by privacy notice Id
  it("generate pdi-iframe by privacy notice Id", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/pdi/iframe`)
      // `/v1/consents/iframe?pdiURL=https%3A%2F%2Fapi.preprod.trustedauthority.io%2Fv1%2Fparticipants%2F6484ffaf86e33f792f17d112`
      .set("Authorization", providerJWT)
      .query({
        userIdentifier: providerUserIdentifier,
        privacyNoticeId: privacyNoticeId,
      })
      .expect(302);
  });

  // // user endpoints
  // getUserAvailableExchanges
  it("getUserAvailableExchanges", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/exchanges/user`)
      .set("Authorization", userJwt)
      .query({ participantId: providerId })
      .expect(200);

    contractbase64 = response.body.exchanges[0].base64Contract;
    expect(response.body.participant.selfDescription).to.equal(
      selfDesc_providerId
    );
    expect(response.body.exchanges).to.not.be.empty;
    expect(response.body.exchanges[0].participantSelfDescription).to.equal(
      selfDesc_consumerId
    );
  });

  // getUserPrivacyNoticesByContract
  it("getUserPrivacyNoticesByContract", async () => {
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .get(
        `/v1/consents/${providerUserIdentifier}/${providerBase64}/${consumerBase64}/${contractbase64}`
      )
      .set("Authorization", userJwt)
      .expect(200);
    console.log("contractrbase64:", contractbase64);
    expect(response.body[0].dataProvider).to.equal(selfDesc_providerId);
    expect(response.body[0].recipients).to.deep.include(selfDesc_consumerId);
  });

  // getUserPrivacyNoticeById
  it("getUserPrivacyNoticeById", async () => {
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/privacy-notices/${privacyNoticeId}/user`)
      .set("Authorization", userJwt)
      .expect(200);
    expect(response.body).to.have.property("_id");
    expect(response.body.contract.orchestrator).to.equal(testProvider1.did);
    expect(response.body.contract.status).to.equal("pending");
    expect(response.body.dataProvider._id).to.equal(testProvider1.identifier);
    expect(response.body.purposes[0].providedBy).to.equal(
      testConsumer1.identifier
    );
    expect(response.body.data[0].providedBy).to.equal(testProvider1.identifier);
  });

  // // giveConsentUser
  // it("giveConsentUser", async () => {
  //   setupnockMocks(providerBase64);
  //   const response = await supertest(serverInstance.app)
  //     .post(`v1/consents/user`)
  //     .send({ privacyNoticeId: privacyNoticeId })
  //     .set("Authorization", userJwt)
  //     .expect(201);
  //   console.log(privacyNoticeId);
  //   expect(response.body).to.have.property("contract");
  // // expect(response.body.dataProvider._id).to.equal(providerId);
  // });

  // getUserConsents
  it("should getUserConsents - by user", async () => {
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/me`)
      .set("x-user-key", providerUserIdentifier);
    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.property("consents");
    expect(response.body.consents[0]._id).to.equal(consentId);
    expect(response.body.consents[0].providerUserIdentifier).to.equal(
      providerUserIdentifier
    );
    expect(response.body.consents[0].consumerUserIdentifier).to.equal(
      consumerUserIdentifier
    );
    expect(response.body.consents[0].consented).to.equal(true);
    expect(response.body.consents[0].dataProvider).to.equal(providerId);
    expect(response.body.consents[0].dataConsumer).to.equal(consumerId);
    expect(response.body.consents[0].status).to.equal("granted");
    expect(response.body.consents[0].privacyNotice).to.equal(privacyNoticeId);
  });

  it("should getUserConsents - by participant", async () => {
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/participants/${providerUserIdentifier}/`)
      .set("Authorization", providerJWT);

    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.property("consents");
    expect(response.body.consents[0]._id).to.equal(consentId);
    expect(response.body.consents[0].providerUserIdentifier).to.equal(
      providerUserIdentifier
    );
    expect(response.body.consents[0].consumerUserIdentifier).to.equal(
      consumerUserIdentifier
    );
    expect(response.body.consents[0].consented).to.equal(true);
    expect(response.body.consents[0].dataProvider).to.equal(providerId);
    expect(response.body.consents[0].dataConsumer).to.equal(consumerId);
    expect(response.body.consents[0].status).to.equal("granted");
    expect(response.body.consents[0].privacyNotice).to.equal(privacyNoticeId);
  });

  // getUserConsentById by user
  it("should getUserConsentById - by user", async () => {
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/me/${consentId}`)
      .set("x-user-key", providerUserIdentifier);
    expect(response.status).to.be.equal(200);
    expect(response.body._id).to.equal(consentId);
    expect(response.body.providerUserIdentifier).to.equal(
      providerUserIdentifier
    );
    expect(response.body.consumerUserIdentifier).to.equal(
      consumerUserIdentifier
    );
    expect(response.body.consented).to.equal(true);
    expect(response.body.dataProvider).to.equal(providerId);
    expect(response.body.dataConsumer).to.equal(consumerId);
    expect(response.body.status).to.equal("granted");
    expect(response.body.privacyNotice).to.equal(privacyNoticeId);
  });

  // getUserConsentById by participant
  it("should getUserConsentById - by participant", async () => {
    const response = await supertest(serverInstance.app)
      .get(`/v1/consents/participants/${providerUserIdentifier}/${consentId}`)
      .set("Authorization", providerJWT);
    expect(response.status).to.be.equal(200);
    expect(response.body._id).to.equal(consentId);
    expect(response.body.providerUserIdentifier).to.equal(
      providerUserIdentifier
    );
    expect(response.body.consumerUserIdentifier).to.equal(
      consumerUserIdentifier
    );
    expect(response.body.consented).to.equal(true);
    expect(response.body.dataProvider).to.equal(providerId);
    expect(response.body.dataConsumer).to.equal(consumerId);
    expect(response.body.status).to.equal("granted");
    expect(response.body.privacyNotice).to.equal(privacyNoticeId);
  });

  // attachTokenToConsent
  it("should attach token to consent", async () => {
    //Mocking import consent
    nock("https://test.consent").post("/consent/import").reply(200, {
      message: "ok",
      token,
      dataExchangeId: "5f6dd4e3495aebd3aca59529",
    });
    const response = await supertest(serverInstance.app)
      .post(`/v1/consents/${consentId}/token`)
      .set("Authorization", providerJWT)
      .send({
        token,
        providerDataExchangeId: "5f6dd4e3495aebd3aca59529",
      });
    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.property(
      "message",
      "successfully forwarded consent to the data consumer"
    );
  });

  // verifyToken
  it("should validate the consent", async () => {
    //mocking export consent
    nock("https://test.consent").post("/consent/export").reply(200, {
      message: "ok",
      token,
      dataExchangeId: "5f6dd4e3495aebd3aca59529",
    });
    setupnockMocks(providerBase64);
    const response = await supertest(serverInstance.app)
      .post(`/v1/consents/${consentId}/validate`)
      .set("Authorization", providerJWT)
      .send({
        token,
      });
    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.property(
      "message",
      "token matches consent token"
    );
    expect(response.body).to.have.property("verified", true);
  });

  describe("Test error", () => {
    it("should not getUserConsents with no authorization", async () => {
      const response = await supertest(serverInstance.app)
        .get(`/v1/consents/me`)
        .expect(401);

      expect(response.body).to.have.property(
        "message",
        "Authorization header missing or invalid"
      );
    });

    // revokeConsent
    // it("should fail to revoke non existent consent", async () => {
    //   const nonExistingConsentId="nonExistingConsentId"
    //   setupnockMocks(providerBase64);
    //   const response = await supertest(serverInstance.app)
    //     .delete(`/v1/consents/${nonExistingConsentId}`)
    //     .set("x-user-key", providerUserIdentifier)
    //     .expect(404);

    //   expect(response.body.error).to.equal("Consent not found");
    // });

    // trigger dataExchange
    it("should not trigger data exchange for a non-existent consent", async () => {
      nock("https://test.consent").post("/consent/export").reply(200, {
        message: "ok",
        token,
        dataExchangeId: "5f6dd4e3495aebd3aca59529",
      });
      setupnockMocks(providerBase64);
      const response = await supertest(serverInstance.app)
        .post(`/v1/consents/6601a6265cbdad603e4e9a8c/data-exchange`)
        .set("x-user-key", providerUserIdentifier)
        .send({ privacyNoticeId: privacyNoticeId });
      expect(response.status).to.be.equal(404);
      expect(response.body).to.have.property("error", "consent not found");
    });

    // test error trigger exchange
    // .status(401)
    // .json({ error: "Consent has not been granted by user" });

    //   // generate iframe
    //   it("should respond with JSON message if no PDI endpoint setup", async () => {
    //     const response = await supertest(serverInstance.app)
    //       .get(`v1/consents/pdi/iframe`)
    //       .set("Authorization", providerJWT)
    //       .query({
    //         userIdentifier: providerUserIdentifier,
    //         privacyNoticeId: privacyNoticeId,
    //       })
    //       .expect("302"); // à vérifier

    //     expect(response.body.message).to.equal("No PDI endpoint setup.");
    //   });
  });
});
