import { EventResolver } from "./Event";
import { TeamResolver } from "./Team";
import { UserResolver } from "./User";

export default [EventResolver , UserResolver , TeamResolver] as const;