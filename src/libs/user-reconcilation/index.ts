import User from "../../models/User/User.model";
import { IUserIdentifier } from "../../types/models";

export const TryFindMatchingUser = async (userIdentifier: IUserIdentifier) => {
  const user = await User.findOne({ email: userIdentifier.email });
  return user;
};
