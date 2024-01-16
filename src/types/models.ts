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

  /**
   * URIs / Identifiers poiting to the Service Offering Self-Descriptions used for data processing
   */
  purposes: {
    purpose: string;
    legalBasis: string;
  }[];

  /**
   * URIs / Identifiers pointing to the Data Resources Self-Descriptions that the user consented to
   */
  data: string[];
  status: "granted" | "revoked" | "pending" | "expired";

  /**
   * URL / identifier pointing to the detailed privacy notice document.
   */
  privacyNotice: string;

  /**
   * URL or brief description of the withdrawal process explaining how the PII principal can withdraw their consent
   */
  withdrawalMethod?: string;

  /**
   * ISO Standard recommends using date and time format or duration according to ISO 8601
   */
  retentionPeriod?: string;

  /**
   * Country / Region code or name
   */
  processingLocations?: string[];

  /**
   * Country / region code or name
   */
  storageLocations?: string[];

  recipientThirdParties?: {
    name?: string;
    location?: string;
    natureOfDataAccess?: string;
  }[];

  /**
   * Ex: "right to access", "right to erasure"...
   * These should correspond to the rights laid out in the applicable privacy legislation
   */
  piiPrincipalRights: string[];
}

export interface IPrivacyNotice extends Document, AllSchemas {
  /**
   * Title of the privacy notice.
   */
  title: string;

  /**
   * Date of the latest revision of the privacy notice.
   */
  lastUpdated: string; // ISO 8601 date format

  /**
   * The identity and contact details of the PII controller (and, where applicable, the PII controller's representative and the data protection officer).
   */
  controllerDetails: {
    name: string;
    contact: string;
    representative?: string;
    dpo?: {
      // Data Protection Officer
      name: string;
      contact: string;
    };
  };

  /**
   * The purposes of the processing for which the personal data are intended, as well as the legal basis for the processing.
   */
  purposes: {
    purpose: string;
    legalBasis: string;
  }[];

  /**
   * Data resources available for data processing by the purposes
   */
  data: string[];

  /**
   * Description of the categories of personal data processed.
   */
  categoriesOfData: string[];

  /**
   * Information about the recipients or categories of recipients of the personal data.
   */
  recipients: string[];

  /**
   * Details regarding transfers of personal data to third countries or international organizations, including the identification of those third countries or international organizations and, in the case of such transfers, the documentation of suitable safeguards.
   */
  internationalTransfers?: {
    countries: string[];
    safeguards: string;
  };

  /**
   * The period for which the personal data will be stored, or if that is not possible, the criteria used to determine that period.
   */
  retentionPeriod: string;

  /**
   * Information about the rights of the PII principal such as access, rectification, erasure, restriction on processing, objection to processing, and data portability.
   */
  piiPrincipalRights: string[];

  /**
   * If the processing is based on consent, the existence of the right to withdraw consent at any time, without affecting the lawfulness of processing based on consent before its withdrawal.
   */
  withdrawalOfConsent: string;

  /**
   * The right to lodge a complaint with a supervisory authority.
   */
  complaintRights: string;

  /**
   * Whether the provision of personal data is a statutory or contractual requirement, or a requirement necessary to enter into a contract, as well as whether the data subject is obliged to provide the personal data and the possible consequences of failure to provide such data.
   */
  provisionRequirements: string;

  /**
   * The existence of automated decision-making, including profiling, and meaningful information about the logic involved, as well as the significance and the envisaged consequences of such processing for the data subject.
   */
  automatedDecisionMaking?: {
    details: string;
  };
}
