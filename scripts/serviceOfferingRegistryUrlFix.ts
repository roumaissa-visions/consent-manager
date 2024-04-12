import mongoose from "mongoose";
import { connect } from "./connect";
// @ts-ignore
import dotenv from "dotenv";
import PrivacyNotice from "../src/models/PrivacyNotice/PrivacyNotice.model";

dotenv.config();

async function serviceOfferingRegistryUrlFix() {
  await connect();

  await PrivacyNotice.updateMany(
    {
      $or: [
        { pricingModel: { $regex: /http:\/\/localhost:3000/ } },
        { "policy.@id": { $regex: /http:\/\/localhost:3000/ } },
        { businessModel: { $regex: /http:\/\/localhost:3000/ } },
      ],
    },
    [
      {
        $set: {
          pricingModel: {
            $map: {
              input: "$pricingModel",
              as: "model",
              in: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$$model",
                      regex: /http:\/\/localhost:3000/,
                    },
                  },
                  then: {
                    $replaceOne: {
                      input: "$$model",
                      find: "http://localhost:3000",
                      replacement: "https://registry.visionstrust.com",
                    },
                  },
                  else: "$$model",
                },
              },
            },
          },
          businessModel: {
            $map: {
              input: "$businessModel",
              as: "model",
              in: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$$model",
                      regex: /http:\/\/localhost:3000/,
                    },
                  },
                  then: {
                    $replaceOne: {
                      input: "$$model",
                      find: "http://localhost:3000",
                      replacement: "https://registry.visionstrust.com",
                    },
                  },
                  else: "$$model",
                },
              },
            },
          },
          policy: {
            $map: {
              input: "$policy",
              as: "model",
              in: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$$model.@id",
                      regex: /http:\/\/localhost:3000/,
                    },
                  },
                  then: {
                    $mergeObjects: [
                      "$$model",
                      {
                        "@id": {
                          $replaceOne: {
                            input: "$$model.@id",
                            find: "http://localhost:3000",
                            replacement: "https://registry.visionstrust.com",
                          },
                        },
                      },
                    ],
                  },
                  else: "$$model",
                },
              },
            },
          },
        },
      },
    ]
  );

  // await Promise.all([
  // ]);

  await mongoose.disconnect();
}

serviceOfferingRegistryUrlFix().then((r) => console.log("success."));
