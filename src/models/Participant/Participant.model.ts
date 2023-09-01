import { Schema, model } from "mongoose";
import { IParticipant } from "../../types/models";
import bcrypt from "bcrypt";

const participantSchema = new Schema<IParticipant>(
  {
    hasLegallyBindingName: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
      required: true,
      default: "",
    },
    address: {
      addressLocality: {
        type: String,
        default: "",
      },
      addressRegion: {
        type: String,
        default: "",
      },
      postalCode: {
        type: String,
        default: "",
      },
      streetAddress: {
        type: String,
        default: "",
      },
    },
    url: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    hasBusinessIdentifier: {
      type: String,
      default: "",
    },
    hasMemberParticipant: [
      {
        type: Schema.Types.ObjectId,
        ref: "Participant",
        default: [],
      },
    ],
    hasLogo: {
      type: String,
      default: "",
    },
    contactPoint: [
      {
        email: {
          type: String,
          required: true,
          default: "",
        },
        telephone: {
          type: String,
          required: true,
          default: "",
        },
        contactType: {
          type: String,
          required: true,
          default: "",
        },
      },
    ],
    hasCompanyType: {
      type: String,
      default: "",
    },
    hasPhoneNumber: {
      type: String,
      required: true,
      default: "",
    },
    hasMemberPerson: [
      {
        name: {
          type: String,
          required: true,
          default: "",
        },
        email: {
          type: String,
          required: true,
          default: "",
        },
      },
    ],
    email: {
      type: String,
      required: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      default: "",
    },
    endpoints: {
      dataExport: { type: String, default: "" },
      dataImport: { type: String, default: "" },
    },
    clientID: { type: String, required: true },
    clientSecret: { type: String, required: true },
    jsonld: {
      type: String,
      required: true,
      default: "",
    },
    schema_version: {
      type: String,
      required: true,
      default: "v0.0.1",
    },
  },
  { timestamps: true }
);

participantSchema.methods.validatePassword = async function (
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Password validation error: " + error);
  }
};

participantSchema.pre<IParticipant>("save", async function (next) {
  try {
    if (this.isModified("password") || this.isNew) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS || "10") || 10;
      const hashedPassword: string = await bcrypt.hash(
        this.password,
        saltRounds
      );
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Participant = model<
  IParticipant & { validatePassword(password: string): Promise<boolean> }
>("Participant", participantSchema);

export default Participant;
