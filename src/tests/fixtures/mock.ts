import nock from "nock";
// Enregistrer les requêtes interceptées
// nock.recorder;({
//   output_objects: true,
// });
const baseURL = "http://localhost:8888";
const pdiURL = process.env.PDI_ENDPOINT || "http://localhost:5173";
export const setupnockMocks = (providerBase64) => {
  // Mocking service offerings
  nock("https://api.test.com/v1")
    .get("/catalog/serviceofferings/65e04da4b37bfc192ddcbdd1")
    .reply(200, {
      "@context": "http://host.docker.internal:4040/v1/serviceoffering",
      "@type": "ServiceOffering",
      _id: "660432088020cd0ef5427e1b",
      name: "test no user interacton",
      providedBy: "6564abb5d853e8e05b132057",
      aggregationOf: [
        "http://host.docker.internal:4040/v1/catalog/dataresources/65e71e4174f9e9026bd5dc41",
      ],
      dependsOn: [],
      policy: [
        {
          "@context": {
            xsd: "http://www.w3.org/2001/XMLSchema#",
            description: {
              "@id": "https://schema.org/description",
              "@container": "@language",
            },
          },
          "@id":
            "http://localhost:3000/static/references/rules/rule-access-4.json",
          title: {
            "@type": "xsd/string",
            "@value": "Count",
          },
          uid: "rule-access-4",
          name: "Count",
          description: [
            {
              "@value": "MUST not use data for more than n times",
              "@language": "en",
            },
          ],
          policy: {
            permission: [
              {
                action: "use",
                target: "@{target}",
                constraint: [
                  {
                    leftOperand: "count",
                    operator: "lt",
                    rightOperand: "@{value}",
                  },
                ],
              },
            ],
          },
          requestedFields: ["target", "value"],
        },
      ],
      termsAndConditions: "",
      dataProtectionRegime: [],
      dataAccountExport: [],
      location: "World",
      description: "des",
      keywords: [],
      dataResources: [
        "http://host.docker.internal:4040/v1/catalog/dataresources/65e71e4174f9e9026bd5dc41",
      ],
      softwareResources: [],
      archived: false,
      visible: true,
      pricing: "180",
      pricingModel: [
        "http://localhost:3000/static/references/pricing-model/dataBased.json",
      ],
      businessModel: [
        "http://localhost:3000/static/references/business-model/subscription.json",
      ],
      maximumConsumption: "",
      maximumPerformance: "",
      pricingDescription: "dfezd",
      userInteraction: true,
      compliantServiceOfferingVC: "",
      serviceOfferingVC: "",
      schema_version: "1.1.0",
      createdAt: "2024-03-27T14:49:44.506Z",
      updatedAt: "2024-03-27T14:50:02.746Z",
      __v: 0,
    });

  nock("https://api.test.com/v1")
    .get("/catalog/serviceofferings/65e04da4b37bfc192ddcbdd0")
    .reply(200, {
      "@context": "http://host.docker.internal:4040/v1/serviceoffering",
      "@type": "ServiceOffering",
      _id: "65e7380074f9e9026bd5edc8",
      name: "CONSUMER PAYLOAD BIL",
      providedBy: "6564aaebd853e8e05b1317c1",
      aggregationOf: [
        "http://api.com/v1/catalog/softwareresources/65e737ed74f9e9026bd5edbb",
      ],
      dependsOn: [],
      policy: [
        {
          "@context": {
            xsd: "http://www.w3.org/2001/XMLSchema#",
            description: {
              "@id": "https://schema.org/description",
              "@container": "@language",
            },
          },
          "@id":
            "http://localhost:3000/static/references/rules/rule-access-4.json",
          title: {
            "@type": "xsd/string",
            "@value": "Count",
          },
          uid: "rule-access-4",
          name: "Count",
          description: [
            {
              "@value": "MUST not use data for more than n times",
              "@language": "en",
            },
          ],
          policy: {
            permission: [
              {
                action: "use",
                target: "@{target}",
                constraint: [
                  {
                    leftOperand: "count",
                    operator: "lt",
                    rightOperand: "@{value}",
                  },
                ],
              },
            ],
          },
          requestedFields: ["target", "value"],
        },
      ],
      termsAndConditions: "",
      dataProtectionRegime: [],
      dataAccountExport: [],
      location: "World",
      description: "desc",
      keywords: [],
      dataResources: [],
      softwareResources: [
        "http://api.com/v1/catalog/softwareresources/65e737ed74f9e9026bd5edbb",
      ],
      archived: false,
      visible: true,
      pricing: "150",
      pricingModel: [
        "http://localhost:3000/static/references/pricing-model/valueBased.json",
      ],
      businessModel: [
        "https://registry.visionstrust.com/static/references/business-model/freemium.json",
        "http://localhost:3000/static/references/business-model/subscription.json",
      ],
      maximumConsumption: "",
      maximumPerformance: "",
      pricingDescription: "desc",
      compliantServiceOfferingVC: "",
      serviceOfferingVC: "",
      schema_version: "1.1.0",
      createdAt: "2024-03-05T15:19:28.562Z",
      updatedAt: "2024-03-29T09:08:33.183Z",
      __v: 0,
      userInteraction: true,
    });

  // Mocking bilateral contracts
  nock(baseURL)
    .get(`/bilaterals/for/${providerBase64}?hasSigned=true`)
    .reply(200, { contracts: [] });

  // Mocking ecosyetem contracts
  nock(baseURL)
    .get(`/contracts/for/${providerBase64}?hasSigned=true`)
    .reply(200, {
      contracts: [
        {
          _id: "65e5d715c99e484e4685a964",
          ecosystem:
            "https://api.test.com/v1/catalog/ecosystems/65e5d7152e3f7f210edcaa77",
          orchestrator:
            "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2b",
          rolesAndObligations: [],
          status: "pending",
          serviceOfferings: [
            {
              participant:
                "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2a",
              serviceOffering:
                "https://api.test.com/v1/catalog/serviceofferings/65e04da4b37bfc192ddcbdd0",
              policies: [
                {
                  description: "CAN use data without any restrictions",
                  permission: [
                    {
                      action: "use",
                      target:
                        "https://api.test.com/v1/catalog/serviceofferings/65e04da4b37bfc192ddcbdd0",
                      constraint: [],
                    },
                  ],
                  prohibition: [],
                },
              ],
              _id: "65e5d73dc99e484e4685a970",
            },
            {
              participant:
                "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2b",
              serviceOffering:
                "https://api.test.com/v1/catalog/serviceofferings/65e04da4b37bfc192ddcbdd1",
              policies: [
                {
                  description: "CAN use data without any restrictions",
                  permission: [
                    {
                      action: "use",
                      target:
                        "https://api.test.com/v1/catalog/serviceofferings/65e04da4b37bfc192ddcbdd1",
                      constraint: [],
                    },
                  ],
                  prohibition: [],
                },
              ],
              _id: "65e5d73dc99e484e4685a971",
            },
          ],
          purpose: [],
          members: [
            {
              participant:
                "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2b",
              role: "orchestrator",
              signature: "hasSigned",
              date: "2024-03-04T14:13:47.598Z",
            },
            {
              participant:
                "https://api.test.com/v1/catalog/participants/656dfb3e282d47cfa6b66b2a",
              role: "participant",
              signature: "hasSigned",
              date: "2024-03-04T14:14:21.410Z",
            },
          ],
          revokedMembers: [],
          createdAt: "2024-03-04T14:13:41.616Z",
          updatedAt: "2024-03-04T14:14:21.409Z",
          __v: 1,
        },
      ],
    });

  // Mocking participants
  nock("https://api.test.com")
    .get(`/v1/catalog/participants/656dfb3e282d47cfa6b66b2b`)
    .reply(200, {
      "@context": "https://api.test.com/v1/participant",
      "@type": "Participant",
      _id: "656dfb3e282d47cfa6b66b2b",
      did: null,
      legalName: "provider",
      legalPerson: {
        registrationNumber: "",
        headquartersAddress: {
          countryCode: "",
        },
        legalAddress: {
          countryCode: "",
        },
        parentOrganization: [],
        subOrganization: [],
      },
      termsAndConditions: "",
      associatedOrganisation: "6564abb5d853e8e05b132057",
      schema_version: "1",
      createdAt: "2023-11-27T14:46:13.705Z",
      updatedAt: "2024-03-06T10:47:26.913Z",
      __v: 0,
      dataspaceConnectorAppKey:
        "60302602dd21b879636317d54886f0181dd409f7f962d2a40a282f8cd099dad0837c86ddaa78a82c650a6d18347767a4c8f2532568ead3d267bf78e262a89444",
      dataspaceEndpoint: "",
    });

  //mocking participant in catalog
  nock("https://api.test.com")
    .get(`/v1/catalog/participants/656dfb3e282d47cfa6b66b2a`)
    .reply(200, {
      "@context": "https://api.test.com/v1/participant",
      "@type": "Participant",
      _id: "656dfb3e282d47cfa6b66b2a",
      did: null,
      legalName: "provider",
      legalPerson: {
        registrationNumber: "",
        headquartersAddress: {
          countryCode: "",
        },
        legalAddress: {
          countryCode: "",
        },
        parentOrganization: [],
        subOrganization: [],
      },
      termsAndConditions: "",
      associatedOrganisation: "6564abb5d853e8e05b132056",
      schema_version: "1",
      createdAt: "2023-11-27T14:46:13.705Z",
      updatedAt: "2024-03-06T10:47:26.913Z",
      __v: 0,
      dataspaceConnectorAppKey:
        "60302602dd21b879636317d54886f0181dd409f7f962d2a40a282f8cd099dad0837c86ddaa78a82c650a6d18347767a4c8f2532568ead3d267bf78e262a89444",
      dataspaceEndpoint: "",
    });

  // Mocking software resources
  nock("http://api.com")
    .get(`/v1/catalog/softwareresources/65e737ed74f9e9026bd5edbb`)
    .reply(200, {
      "@context": "http://localhost:4040/v1/softwareresource",
      "@type": "SoftwareResource",
      _id: "666fed36e6c0faa2f36e8e96",
      providedBy: "666fed32e6c0faa2f36e8e7d",
      name: "Test software resources 1",
      description: "software resources Test description 1",
      aggregationOf: [],
      copyrightOwnedBy: ["Your Company"],
      license: [],
      policy: [],
      category: "5f8ed518651f1648e0d8162d",
      locationAddress: [],
      users_clients: 22,
      demo_link: "",
      relevant_project_link: "",
      schema_version: "1.1.0",
      usePII: false,
      isAPI: false,
      b2cDescription: "",
      jurisdiction: "",
      retention_period: "",
      recipient_third_parties: [],
      createdAt: "2024-06-17T08:00:54.470Z",
      updatedAt: "2024-06-17T08:00:54.470Z",
      __v: 0,
    });

  // Mocking data resources
  nock("http://api.com")
    .get(`/v1/catalog/dataresources/666fed34e6c0faa2f36e8e85`)
    .reply(200, {
      "@context": "http://localhost:4040/v1/dataresource",
      "@type": "DataResource",
      _id: "666fed34e6c0faa2f36e8e85",
      aggregationOf: [],
      name: "Test data resources 1",
      description: "data resources Test description 1",
      copyrightOwnedBy: [],
      license: [],
      policy: [],
      producedBy: "666fed31e6c0faa2f36e8e75",
      exposedThrough: [],
      obsoleteDateTime: "",
      expirationDateTime: "",
      containsPII: true,
      anonymized_extract: "{skills: 'abcd'}",
      archived: false,
      attributes: ["skills"],
      category: "5f8ed518651f1648e0d8162d",
      isPayloadForAPI: true,
      country_or_region: "BR-BRU",
      entries: 100,
      subCategories: [],
      schema_version: "1",
      b2cDescription: "",
      createdAt: "2024-06-17T08:00:52.365Z",
      updatedAt: "2024-06-17T08:00:52.365Z",
      __v: 0,
    });
  // Mocking pdi endpoint
  // nock(pdiURL)
  // .get(`/`)
  // .reply(200);
};
