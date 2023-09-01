import session from "express-session";
import MongoStore from "connect-mongo";
import crypto from "crypto";

/**
 * Initializes the session with the mongo store
 * @param connection This should be a mongoose.Connection, but there is an issue in connect-mongo with typescript making it incompatible when running MongoStore.create()
 * @returns The session object
 */
export const initSession: any = () => {
  let mongoUri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

  if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
    mongoUri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
  }

  return session({
    genid: () => {
      return crypto.randomUUID();
    },
    secret: process.env.SESSION_SECRET,
    resave: true, // Verify this setting (getting errors with touch method on cold start)
    saveUninitialized: false,
    name: process.env.SESSION_COOKIE_NAME,
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({ mongoUrl: mongoUri }),
  });
};
