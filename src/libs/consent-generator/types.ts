import { PIIController, Service } from "../../types";

export interface ConsentGenerationOptions {
  /**
   * The jurisdiction or legal territory where the Consent Receipt is applicable.
   */
  jurisdiction: string;
  /**
   * The method used to collect the consent (e.g., web form, mobile app).
   */
  collectionMethod: string;
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
   * The URL to the privacy policy applicable to this consent.
   */
  policyUrl: string;
  /**
   * An array of data controllers associated with the consent.
   */
  piiControllers: PIIController[];
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
