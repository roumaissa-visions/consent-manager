import { Schema, model } from "mongoose";
import { IUserIdentifier } from "../../types/models";

const schema = new Schema<IUserIdentifier>(
  {
    attachedParticipant: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    email: { type: String, required: true },
    identifier: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jsonld: {
      type: String,
      required: true,
      default: "",
    },
    schema_version: {
      type: String,
      required: true,
      default: "v0.1.0",
    },
  },
  { timestamps: true }
);

const UserIdentifier = model<IUserIdentifier>("UserIdentifier", schema);

export default UserIdentifier;
