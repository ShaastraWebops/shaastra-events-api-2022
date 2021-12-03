import { Team } from "../entities/Team";
import { RegistraionType } from ".";
import { Event } from "../entities/Event"

export const isRegisteredInEvent = async (eventId: string, userId: string) => {
    const event = await Event.findOneOrFail(eventId, { relations: ["registeredUsers", "registeredTeam"] });

    // return event.registeredUsers.includes(user);
    if(event.registrationType === RegistraionType.INDIVIDUAL) {
        const userF = event.registeredUsers.filter((useR) => useR.id === userId);
        return userF.length === 1;
    }

    let isRegistered = false;
    await Promise.all(event.registeredTeam?.map(async (team) => {
        const teaM = await Team.findOneOrFail(team.id, { relations: ["members"] });

        const userF = teaM.members.filter((member) => member.id === userId);
        if(userF.length === 1) isRegistered = true;
    }));

    return isRegistered;
}