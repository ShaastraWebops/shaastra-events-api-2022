import { Event } from "../entities/Event";
import { AddEventInput } from "../inputs/Event";
import { Arg, Query, Resolver } from "type-graphql";

@Resolver()
export class EventResolver {

    @Query(()=> Boolean)
    async addEvent(@Arg("data") data: AddEventInput ){
        const event = Event.create({...data}).save();
        return !!event;
    }
 
}
