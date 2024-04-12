import mongoose from "mongoose";
import { connect } from "./connect";
// @ts-ignore
import dotenv from "dotenv";
import PrivacyNotice from "../src/models/PrivacyNotice/PrivacyNotice.model";
import { type } from "node:os";

dotenv.config();

async function serviceOfferingRegistryUrlFix() {
  await connect();

  const privacyNotices = await PrivacyNotice.find();

  privacyNotices.forEach((privacyNotice) => {
    console.log(privacyNotice.data);
    privacyNotice.data.map((dt: any) => {
      console.log(dt);
      if (typeof dt !== "object") {
        console.log("pas object");
      }
    });

    privacyNotice.purposes.map((purpose: any) => {
      if (purpose.purpose) {
        console.log("purpose exist");
      }
    });
  });

  await mongoose.disconnect();
}

serviceOfferingRegistryUrlFix().then((r) => console.log("success."));
