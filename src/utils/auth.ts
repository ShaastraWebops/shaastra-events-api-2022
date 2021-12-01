import { AuthChecker } from "type-graphql";
import { MyContext } from "./context";

export const authChecker: AuthChecker<MyContext> = async (
  { context: { user } },
  roles
) => {
  if (!user) return false;
  if (roles.length === 0) return true;
  if (roles.includes(user.role)) return true;
  return false;
};