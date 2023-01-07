import { BlitzChessResolver } from "./BlitzChess";
import { EventResolver } from "./Event";
import { EventFAQResolver } from "./EVENTFAQ";
import { TeamResolver } from "./Team";
import { UserResolver } from "./User";

export default [EventResolver , UserResolver , TeamResolver , EventFAQResolver , BlitzChessResolver] as const;
// export default [UserResolver] as const;