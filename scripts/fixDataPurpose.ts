import mongoose, { Schema, Types } from "mongoose";
import { connect } from "./connect";
// @ts-ignore
import dotenv from "dotenv";
import PrivacyNotice from "../src/models/PrivacyNotice/PrivacyNotice.model";
import axios from "axios";

dotenv.config();

async function fixDataPurpose() {
  await connect();

  const privacyNotices: any = await PrivacyNotice.find();

  for (const privacyNotice of privacyNotices) {
    let data = [];
    let purp = [];

    for (const dt of privacyNotice.data) {
      if (typeof dt !== "object") {
        const response = await axios.get(dt);
        for (const dataResource of response.data.dataResources) {
          data.push({
            serviceOffering: dt,
            resource: dataResource,
            _id: new mongoose.Types.ObjectId(),
          });
        }
      }
    }

    for (const purpose of privacyNotice.purposes) {
      if (purpose.purpose) {
        const response = await axios.get(purpose.purpose);
        for (const softwareResource of response.data.softwareResources) {
          purp.push({
            serviceOffering: purpose.purpose,
            resource: softwareResource,
            legalBasis: purpose.legalBasis,
            _id: new mongoose.Types.ObjectId(),
          });
        }
      }
    }

    if (purp.length > 0) {
      privacyNotice.purposes = purp;
    }

    if (data.length > 0) {
      privacyNotice.data = data;
    }

    if (purp.length > 0 || data.length > 0) {
      await privacyNotice.save();
    }
  }

  await mongoose.disconnect();
}

fixDataPurpose().then((r) => console.log("success."));
