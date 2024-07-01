import UserIdentifier from "../models/UserIdentifier/UserIdentifier.model";
import User from "../models/User/User.model";
import { IUser } from "../types/models";
import mongoose from "mongoose";

export const checkUserIdentifier = async (
  email: string,
  participantId: string,
  userIdentifier: string,
  existingUser?: IUser
) => {
  const verifyUserIdentifier = await UserIdentifier.findOne({
    attachedParticipant: {
      $ne: participantId,
    },
    email,
  });

  //if a user identifier is found
  if (verifyUserIdentifier) {
    //find user reattached to this userIdentifier
    let user: IUser;
    if (existingUser) user = existingUser;
    else
      user = await User.findOne({
        $or: [{ identifiers: verifyUserIdentifier._id }, { email }],
      });

    //if user is found add new userIdentifier to user
    if (user) {
      user.identifiers.push(new mongoose.Types.ObjectId(userIdentifier));
      await user.save();
    } else {
      const newUser = new User({
        email,
        identifiers: [verifyUserIdentifier._id, userIdentifier],
      });
      await newUser.save();

      user = newUser;
    }

    return user;
  }
};
