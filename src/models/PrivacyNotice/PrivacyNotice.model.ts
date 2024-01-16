import { Schema, model } from "mongoose";
import { IPrivacyNotice } from "../../types/models";

const schema = new Schema<IPrivacyNotice>(
  {
    title: String,
    lastUpdated: String,
    controllerDetails: {
      name: String,
      contact: String,
      representative: String,
      dpo: {
        name: String,
        contact: String,
      },
    },
    purposes: [
      {
        purpose: String,
        legalBasis: String,
      },
    ],
    categoriesOfData: [String],
    data: [String],
    recipients: [String],
    internationalTransfers: {
      countries: [String],
      safeguards: String,
    },
    retentionPeriod: String,
    piiPrincipalRights: [String],
    withdrawalOfConsent: String,
    complaintRights: String,
    provisionRequirements: String,
    automatedDecisionMaking: {
      details: String,
    },
    jsonld: { type: String, required: true },
    schema_version: { type: String, default: "0.1.0" },
  },
  { timestamps: true }
);

const PrivacyNotice = model<IPrivacyNotice>("PrivacyNotice", schema);

export default PrivacyNotice;
