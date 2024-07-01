export const consentEvent = {
  given: {
    eventTime: new Date().toISOString(),
    validityDuration: "0",
    eventType: "explicit",
    eventState: "consent given",
  },
  revoked: {
    eventTime: new Date().toISOString(),
    validityDuration: "0",
    eventType: "explicit",
    eventState: "consent revoked",
  },
  refused: {
    eventTime: new Date().toISOString(),
    validityDuration: "0",
    eventType: "explicit",
    eventState: "consent refused",
  },
  reConfirmed: {
    eventTime: new Date().toISOString(),
    validityDuration: "0",
    eventType: "explicit",
    eventState: "consent re-confirmed",
  },
  terminated: {
    eventTime: new Date().toISOString(),
    validityDuration: "0",
    eventType: "explicit",
    eventState: "consent terminated",
  },
};
