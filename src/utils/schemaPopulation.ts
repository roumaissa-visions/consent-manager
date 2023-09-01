import { PARTICIPANT_SELECTION } from "./schemaSelection";

export const ECOSYSTEM_POPULATION = [
  {
    path: "rolesAndResponsibilities.stakeholders.organisation",
    select: PARTICIPANT_SELECTION,
  },
  {
    path: "rolesAndResponsibilities.stakeholders.dataOfferings",
  },
  {
    path: "rolesAndResponsibilities.stakeholders.serviceOfferings",
  },
  {
    path: "dataValue.dataValueSolution.provider",
    select: PARTICIPANT_SELECTION,
  },
  {
    path: "dataValue.dataValueSolution.offering",
    select: PARTICIPANT_SELECTION,
  },
  {
    path: "dataValue.dataNetworkSolutions.pays",
    select: PARTICIPANT_SELECTION,
  },
];

export const SERVICE_POPULATION = [
  {
    path: "offeredBy",
    select: PARTICIPANT_SELECTION,
  },
];

export const DATA_OFFERING_POPULATION = [
  {
    path: "offeredBy",
    select: PARTICIPANT_SELECTION,
  },
];
