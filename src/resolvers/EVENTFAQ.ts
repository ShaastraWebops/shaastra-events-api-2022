import { EventFAQ } from "../entities/EventFAQ";
import { Event } from "../entities/Event";
import { Arg, Authorized, Mutation, Resolver } from "type-graphql";
import { CreateEventFAQInput, EditEventFAQInput } from "../inputs/EVENTFAQ";

@Resolver(EventFAQ)
export class EventFAQResolver {

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async createEventFAQ(@Arg("data") eventFAQInput: CreateEventFAQInput, @Arg("EventID") id: string) {
        const event = await Event.findOneOrFail({ where: { id } });
        const eventFAQ = await EventFAQ.create({ ...eventFAQInput, event }).save();

        return !!eventFAQ;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async editEventFAQ(@Arg("data") eventFAQInput: EditEventFAQInput, @Arg("EventFAQID") id: string) {
        const { affected } = await EventFAQ.update(id, eventFAQInput);
        return affected === 1;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async deleteEventFAQ(@Arg("EventFAQID") id: string) {
        const { affected } = await EventFAQ.delete(id);
        return affected === 1;
    }
}