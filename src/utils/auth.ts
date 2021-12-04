import { AuthChecker } from "type-graphql";
import { MyContext } from "./context";

export const authChecker: AuthChecker<MyContext> = async (
  { context: { user } },
  roles
) => {
  if (!user) {
    if(roles.length >0 && roles[0] === "ADMIN") return false
    else
    throw new Error("User Not logged in")
  };
  if (roles.length === 0) return true;
  if (roles.includes(user.role)) return true;
  return false;
};