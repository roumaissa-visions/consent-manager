import { Types, Document, Model } from "mongoose";

export interface AllSchemas {
  schema_version: string;

  /**
   * JSON-LD Self Description
   */
  jsonld: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipant extends Document, AllSchemas {
  hasLegallyBindingName: string;

  /**
   * DID identifier
   */
  identifier: string;

  /**
   * @type schema:PostalAddress
   */
  address: {
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    streetAddress: string;
  };

  url: string;

  description: string;

  /**
   * @type gax-participant:hasBusinessIdentifier
   */
  hasBusinessIdentifier: string;

  /**
   * Sub participants
   * ref: IParticipant
   * @type gax-participant:hasMemberParticipant
   */
  hasMemberParticipant: Types.ObjectId[] | IParticipant[];

  /**
   * Logo
   * @type gax-participant:hasLogo
   */
  hasLogo: string;

  /**
   * @type schema:ContactPoint
   */
  contactPoint: {
    email: string;
    telephone: string;
    contactType: string;
  }[];

  /**
   * @type gax-participant:hasCompanyType
   */
  hasCompanyType: string;

  /**
   * @type gax-participant:hasPhoneNumber
   */
  hasPhoneNumber: string;

  /**
   * @type: gax-participant:hasMemberPerson
   */
  hasMemberPerson: {
    name: string;
    email: string;
  }[];

  endpoints: {
    dataImport?: string;
    dataExport?: string;
    consentImport?: string;
    consentExport?: string;
  };

  email: string;

  password: string;

  /**
   * Credentials to communicate with the Consent API
   */
  clientID: string;
  clientSecret: string;
}

export interface IParticipantModel extends Model<IParticipant> {
  validatePassword(password: string): Promise<boolean>;
}

export type FederatedIdentifier = {
  /**
   * MongoDB id
   */
  id: Types.ObjectId | null;

  /**
   * DID identifier, useful to identify the participant
   * if coming from another instance
   */
  identifier: string;
};

export interface IUserIdentifier extends Document, AllSchemas {
  attachedParticipant: Types.ObjectId | null;
  email: string;
  /**
   * Alternative to email for decentralized identifiers
   */
  identifier: string;
  user: Types.ObjectId | null;
}

export interface IUser extends Document, AllSchemas {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  identifiers: Types.ObjectId[];
  oauth: {
    scopes: string[];
    refreshToken?: string;
  };
}

export interface IConsent extends Document, AllSchemas {
  user: Types.ObjectId | null;
  userIdentifiers: Types.ObjectId[];
  identifier: string;
  consented: boolean;
  purposes: string[];
  data: string[];
  status: "granted" | "revoked" | "pending";
}
