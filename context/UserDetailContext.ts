import { createContext } from "react";

export interface UserDetailContextType {
  userDetails: UserType | null;
  setUserDetails: (user: UserType | null) => void;
}

export const UserDetailContext = createContext<
  UserDetailContextType | undefined
>(undefined);
