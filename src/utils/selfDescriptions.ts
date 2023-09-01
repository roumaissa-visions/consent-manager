import { IParticipant } from "../types/models";

/**
 * Generates a JSON-LD for the participant based on the schema
 */
export const participantToSelfDescription = (p: IParticipant) => {
  const jsonLd = {
    "@context": {
      sh: "http://www.w3.org/ns/shacl#",
      schema: "http://www.w3.org/2001/XMLSchema#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      "gax-core": "http://w3id.org/gaia-x/core#",
      "gax-participant": "http://w3id.org/gaia-x/participant#",
      dcat: "http://www.w3.org/ns/dcat#",
      dcterms: "http://purl.org/dc/terms/",
      did: "https://www.w3.org/TR/did-core/#",
    },
    "@id": p.id,
    "@type": "Participant",
    "did:identifier": p.identifier,
    // ! PROPOSITION
    consentManager: {
      // Would be an url or globally known Identifier in the federation
      solution: process.env.FEDERATED_APPLICATION_IDENTIFIER,
      // The id of the participant in the consentManager solution
      idInSolution: p.id,
      // identifier:
      //   process.env.FEDERATED_APPLICATION_IDENTIFIER + "/participants/" + p.id,
    },
    "gax-participant:hasLegallyBindingName": p?.hasLegallyBindingName,
    address: {
      "@type": "schema:PostalAddress",
      "schema:addressLocality": p.address.addressLocality,
      "schema:addressRegion": p.address.addressRegion,
      "schema:postalCode": p.address.postalCode,
      "schema:streetAddress": p.address.streetAddress,
    },
    url: {
      "@type": "xsd:anyURI",
      "@value": p.url,
    },
    description: {
      "@type": "xsd:string",
      "@value": p.description,
    },
    "gax-participant:hasBusinessIdentifier": p.hasBusinessIdentifier,
    "gax-participant:hasLogo": {
      "@value": p.hasLogo,
      "@type": "xsd:anyURI",
    },
    "gax-participant:hasMemberParticipant": p.hasMemberParticipant.map(
      (member) => {
        return {
          "@id": member.id,
          "did:identifier": member.id,
        };
      }
    ),
    contactPoint: p.contactPoint.map((contact) => {
      return {
        "@type": "schema:ContactPoint",
        "schema:email": contact.email,
        "schema:telephone": contact.telephone,
        "schema:contactType": contact.contactType,
      };
    }),
    "gax-participant:hasCompanyType": p.hasCompanyType,
    "gax-participant:hasPhoneNumber": p.hasPhoneNumber,
    "gax-participant:hasMemberPerson": p.hasMemberPerson.map((person) => {
      return {
        "@type": "schema:Person",
        "schema:name": person.name,
      };
    }),
    email: p.email,
    endpoints: {
      dataExport: p.endpoints.dataExport, // Endpoint for incoming data requests
      dataImport: p.endpoints.dataImport, // Endpoint for data reception
    },
  };

  return JSON.stringify(jsonLd, null, 2);
};
