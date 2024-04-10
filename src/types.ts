/**
 * Represents the Consent Receipt.
 * @interface
 */
export interface ConsentReceipt {
  /**
   * The version of the Consent Receipt.
   */
  version: string;
  /**
   * The jurisdiction or legal territory where the Consent Receipt is applicable.
   */
  jurisdiction: string;
  /**
   * The timestamp when the consent was given (Unix timestamp in milliseconds).
   */
  consentTimestamp: number;
  /**
   * The method used to collect the consent (e.g., web form, mobile app).
   */
  collectionMethod: string;
  /**
   * The unique identifier for the Consent Receipt.
   */
  consentReceiptID: string;
  /**
   * Optional public key associated with the Consent Receipt.
   */
  publicKey?: string;
  /**
   * The language used for the Consent Receipt.
   */
  language?: string;
  /**
   * The unique identifier for the data subject (user).
   */
  piiPrincipalId: string;
  /**
   * An array of data controllers associated with the consent.
   */
  piiControllers: PIIController[];
  /**
   * The URL to the privacy policy applicable to this consent.
   */
  policyUrl: string;
  /**
   * An array of services and their purposes within this consent.
   */
  services: Service[];
  /**
   * Indicates whether the consent contains sensitive data.
   */
  sensitive: boolean;
  /**
   * An array of categories for Special Personal Identifiable Information (SPI Cat).
   */
  spiCat: string[];
}

/**
 * Represents a data controller associated with the consent.
 * @interface
 */
export interface PIIController {
  /**
   * The name or identifier of the data controller.
   */
  piiController: string;
  /**
   * Indicates whether the data controller is acting on behalf of another entity.
   */
  onBehalf?: boolean;
  /**
   * The name of a contact person associated with the data controller.
   */
  contact: string;
  /**
   * Optional physical address of the data controller.
   */
  address?: Address;
  /**
   * The email address for contacting the data controller.
   */
  email: string;
  /**
   * The phone number for contacting the data controller.
   */
  phone: string;
  /**
   * Optional URL to the privacy policy or consent receipt endpoint of the data controller.
   */
  piiControllerUrl?: string;
}

/**
 * Represents the address of a data controller.
 * @interface
 */
export interface Address {
  /**
   * The street address of the data controller.
   */
  streetAddress?: string;
  /**
   * The country where the data controller is located (ISO 3166-1 alpha-2 code).
   */
  addressCountry?: string;
}

/**
 * Represents a service and its purposes within the consent.
 * @interface
 */
export interface Service {
  /**
   * The name or identifier of the service.
   */
  service: string;
  /**
   * An array of purposes for data processing within this service.
   */
  purposes: Purpose[];
}

/**
 * Represents the purpose for which the data is being processed within the service.
 * @interface
 */
export interface Purpose {
  /**
   * The serviceOffering for which the data is being processed within the service.
   */
  serviceOffering: string;
  /**
   * The resource for which the data is being processed within the service.
   */
  resource: string;
  /**
   * The type of consent obtained for this purpose (e.g., EXPLICIT).
   */
  consentType: string;
  /**
   * An array of purpose categories to classify the purpose.
   */
  purposeCategory: string[];
  /**
   * An array of PII categories processed for this purpose.
   */
  piiCategory: string[];
  /**
   * Indicates whether this purpose is the primary purpose for the service.
   */
  primaryPurpose?: boolean;
  /**
   * The duration or period for which the data will be retained and processed for this purpose.
   */
  termination: string;
  /**
   * Indicates whether the data will be disclosed to third parties for this purpose.
   */
  thirdPartyDisclosure: boolean;
  /**
   * The name of the third party to whom the data will be disclosed (if thirdPartyDisclosure is true).
   */
  thirdPartyName?: string;
}
