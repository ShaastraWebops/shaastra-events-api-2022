import { Team } from "../entities/Team";
import { Arg, Authorized, Ctx, FieldResolver, Mutation, Resolver, Root } from "type-graphql";
import { MyContext } from "../utils/context";
import { CreateTeamInput } from "../inputs/Team";
import { User } from "../entities/User";
import { Event } from "../entities/Event";
import { RegistraionType } from "../utils";
import { isRegisteredInEvent } from "../utils/isRegisteredInEvent";

@Resolver(Team)
export class TeamResolver {

    @Authorized()
    @Mutation(() => Boolean)
    async createTeamAndRegister(@Arg("data") { name, members, eventID }: CreateTeamInput, @Ctx() { user }: MyContext) {
        const event = await Event.findOneOrFail(eventID);

        const startDate = new Date(event.registrationOpenTime);
        const currentDate = new Date();
        const endDate = new Date(event.registrationCloseTime);
        if(currentDate.getTime() <= startDate.getTime()) throw new Error("Registration is not opened yet");
        if(currentDate.getTime() >= endDate.getTime()) throw new Error("Registration Closed");

        if(event.registrationType === RegistraionType.NONE) throw new Error("Registration for this event is not required")
        if(event.registrationType === RegistraionType.INDIVIDUAL) throw new Error("Not allowed for team registration")
        if(members?.length > event.teamSize) throw new Error("Team limit exceed");

        const team =  Team.create();
        team.name = name;
        team.event = event;
        team.members = [];

        members.push(user.shaastraID);
        console.log(members)
        await Promise.all(members?.map(async (member) => {
            const userM = await User.findOneOrFail({ where: { shaastraID: member } });

            const { shaastraID } = userM;
            if(!userM) throw new Error(`Invalid SJ ID ${shaastraID}`);
           
            const isReg = await isRegisteredInEvent(eventID, user.id);
            if(isReg) throw new Error(`${shaastraID} is already part of registered for this event`)

            team.members.push(userM);
        }));

        await team.save();
        return !!team;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async leaveTeam(@Arg("data") teamID: string, @Ctx() { user }: MyContext ) {
        const team = await Team.findOneOrFail(teamID, { relations: ["members"] });

        team.members = team.members.filter((member) => member.id !== user.id);
        await team.save();

        return !!team;
    }

    @Authorized()
    @FieldResolver(() => [User])
    async members(@Root() { id }: Team ) {
        const team = await Team.findOneOrFail(id, { relations: ["members"] });
        return team.members;
    } 
}