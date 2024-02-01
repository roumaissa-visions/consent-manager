import Joi from "joi";

export const participantCreationSchema = Joi.object({
  legalName: Joi.string().required(),
  identifier: Joi.string().required(),
  did: Joi.string(),
  selfDescriptionURL: Joi.string(),
  email: Joi.string().required(),
  endpoints: Joi.object({
    dataExport: Joi.string().optional(),
    dataImport: Joi.string().optional(),
    consentExport: Joi.string().optional(),
    consentImport: Joi.string().optional(),
  }),
  clientID: Joi.string().required(),
  clientSecret: Joi.string().required(),
});

export const participantUpdateSchema = Joi.object({
  legalName: Joi.string().optional(),
  identifier: Joi.string().optional(),
  selfDescriptionURL: Joi.string().optional(),
  email: Joi.string().optional(),
  endpoints: Joi.object({
    dataExport: Joi.string().optional(),
    dataImport: Joi.string().optional(),
    consentExport: Joi.string().optional(),
    consentImport: Joi.string().optional(),
  }),
});
