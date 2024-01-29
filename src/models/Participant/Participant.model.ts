import { Schema, model } from "mongoose";
import { IParticipant } from "../../types/models";

const participantSchema = new Schema<IParticipant>(
  {
    did: {
      type: String,
      required: true,
      default: "",
    },
    legalName: {
      type: String,
      required: true,
    },
    legalPerson: {
      registrationNumber: { type: String, default: "" },
      headquartersAddress: {
        countryCode: { type: String, default: "" },
      },
      legalAddress: {
        countryCode: { type: String, default: "" },
      },
      parentOrganization: [{ type: String }],
      subOrganization: [{ type: String }],
    },
    selfDescriptionURL: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      default: "",
    },
    dataspaceEndpoint: String,
    endpoints: {
      dataExport: { type: String, default: "" },
      dataImport: { type: String, default: "" },
      consentImport: { type: String, default: "" },
      consentExport: { type: String, default: "" },
    },
    clientID: { type: String, required: true },
    clientSecret: { type: String, required: true },
    jsonld: {
      type: String,
      default: "",
    },
    schema_version: {
      type: String,
      default: "v0.1.0",
    },
  },
  { timestamps: true }
);

const Participant = model<IParticipant>("Participant", participantSchema);

export default Participant;
