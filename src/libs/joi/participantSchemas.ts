import Joi from "joi";

export const participantCreationSchema = Joi.object({
  hasLegallyBindingName: Joi.string().required(),
  identifier: Joi.string().required(),
  address: Joi.object({
    addressLocality: Joi.string(),
    addressRegion: Joi.string(),
    postalCode: Joi.string(),
    streetAddress: Joi.string(),
  }),
  url: Joi.string(),
  description: Joi.string().required(),
  hasBusinessIdentifier: Joi.string(),
  hasMemberParticipant: Joi.array().items(Joi.string()).default([]),
  hasLogo: Joi.string(),
  contactPoint: Joi.array().items(
    Joi.object({
      email: Joi.string().required(),
      telephone: Joi.string().required(),
      contactType: Joi.string().required(),
    })
  ),
  hasCompanyType: Joi.string(),
  hasPhoneNumber: Joi.string().required(),
  hasMemberPerson: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
    })
  ),
  email: Joi.string().required(),
  password: Joi.string().required(),
  endpoints: Joi.object({
    dataExport: Joi.string(),
    dataImport: Joi.string(),
  }),
});

export const participantUpdateSchema = Joi.object({
  hasLegallyBindingName: Joi.string(),
  identifier: Joi.string(),
  address: Joi.object({
    addressLocality: Joi.string(),
    addressRegion: Joi.string(),
    postalCode: Joi.string(),
    streetAddress: Joi.string(),
  }),
  url: Joi.string(),
  description: Joi.string(),
  hasBusinessIdentifier: Joi.string(),
  hasMemberParticipant: Joi.array().items(Joi.string()),
  hasLogo: Joi.string(),
  contactPoint: Joi.array().items(
    Joi.object({
      email: Joi.string().required(),
      telephone: Joi.string().required(),
      contactType: Joi.string().required(),
    })
  ),
  hasCompanyType: Joi.string(),
  hasPhoneNumber: Joi.string(),
  hasMemberPerson: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
    })
  ),
  email: Joi.string(),
  password: Joi.string(),
  endpoints: Joi.object({
    dataExport: Joi.string(),
    dataImport: Joi.string(),
  }),
});
