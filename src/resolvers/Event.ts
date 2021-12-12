import { Event } from "../entities/Event";
import { AddEventInput, EditEventInput } from "../inputs/Event";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { RegistraionType, Vertical } from "../utils";
import { User } from "../entities/User";
import { Team } from "../entities/Team";
import { MyContext } from "../utils/context";
import { isRegisteredInEvent } from "../utils/isRegisteredInEvent";
import { EventFAQ } from "../entities/EventFAQ";
import Razorpay from "razorpay";
import crypto from "crypto";
import EventPay from "../entities/EventPay";
import { UpdateEventPayInput } from "../inputs/EventPay";

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID!,
  key_secret: process.env.RAZORPAY_SECRET,
});

@ObjectType("GetEventsOutput")
class GetEventsOutput {
  @Field(() => [Event])
  events: Event[];

  @Field(() => Number)
  count: Number;
}

@ObjectType("RegisterOutput")
class RegisterOutput {
  @Field(() => Boolean, { nullable: true })
  registered: boolean | undefined;

  @Field(() => EventPay, { nullable: true })
  eventPay: EventPay | undefined;
}

@Resolver(Event)
export class EventResolver {
  @Authorized(["ADMIN"])
  @Mutation(() => Event)
  async addEvent(@Arg("data") data: AddEventInput) {
    const event = await Event.create({ ...data }).save();
    return event;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async editEvent(
    @Arg("data") data: EditEventInput,
    @Arg("eventID") id: string
  ) {
    const { affected } = await Event.update(id, { ...data });
    return affected === 1;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteEvent(@Arg("id") id: string) {
    const { affected } = await Event.delete(id);
    return !!affected;
  }

  @Authorized()
  @Mutation(() => RegisterOutput)
  async register(@Arg("EventID") id: string, @Ctx() { user }: MyContext) {
    const event = await Event.findOneOrFail(id, {
      relations: ["registeredUsers"],
    });

    const startDate = new Date(event.registrationOpenTime);
    const currentDate = new Date();
    const endDate = new Date(event.registrationCloseTime);
    if (currentDate.getTime() <= startDate.getTime())
      throw new Error("Registration is not opened yet");
    if (currentDate.getTime() >= endDate.getTime())
      throw new Error("Registration Closed");
    if (!user) throw new Error("Login to Register");
    if (event.registrationType === RegistraionType.NONE)
      throw new Error("Registration for this event is not required");
    if (event.registrationType === RegistraionType.TEAM)
      throw new Error("Not allowed for individual registration");

    const userF = event.registeredUsers.filter((useR) => useR.id === user.id);
    if (userF.length === 1) throw new Error("User registered already");
    if (!event.registrationfee || Number(event.registrationfee) === 0) {
      event.registeredUsers.push(user);
      await event.save();
      return { registered: !!event };
    } else {
      /* Create the order id */
      let orderId: string = "";
      const options = {
        amount: Number(event.registrationfee) * 100,
        currency: "INR",
        receipt: event.name,
      };
      await instance.orders.create(options, function (err: any, order: any) {
        if (err) throw new Error("Order Creation failed. Please Retry");
        orderId = order.id;
      });
      if (orderId === "")
        throw new Error("Order Creation failed. Please Retry");

      /* Store the details in database */
      const order = await EventPay.create({
        orderId,
        amount: Number(options.amount),
        event,
        user,
      }).save();
      return { eventPay: order };
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateEventPay(
    @Arg("data") data: UpdateEventPayInput,
    @Arg("EventId") id: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      /* Verify the signature */
      const body = data.orderId + "|" + data.payementId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET!)
        .update(body.toString())
        .digest("hex");
      if (expectedSignature !== data.paymentSignature)
        throw new Error("Invalid Payment Signature");

      /* Update the details in database */
      const { affected } = await EventPay.update(
        { orderId: data.orderId },
        {
          payementId: data.payementId,
          paymentSignature: data.paymentSignature,
          isPaid: true,
        }
      );
      if (affected !== 1) throw new Error("Update failed");

      /* Update the user details in registered users */
      const event = await Event.findOneOrFail(id, {
        relations: ["registeredUsers"],
      });
      event.registeredUsers.push(user);
      await event.save();

      return !!event;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Query(() => GetEventsOutput)
  async getEvents(
    @Arg("filter", { nullable: true }) vertical: Vertical,
    @Arg("skip", { nullable: true }) skip: number,
    @Arg("limit", { nullable: true }) take: number
  ) {
    let filter = {};
    if (!!vertical) filter = { vertical };
    const events = await Event.find({ where: filter, skip, take });
    const count = await Event.count({ where: filter });

    return { events, count };
  }

  @Query(() => Event)
  async getEvent(@Arg("EventID") id: string) {
    const event = await Event.findOneOrFail({ where: { id } });
    return event;
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => [User])
  async registeredUser(@Root() { id }: Event) {
    const event = await Event.findOneOrFail(id, {
      relations: ["registeredUsers"],
    });

    return event.registeredUsers;
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => Number)
  async registeredUserCount(@Root() { id }: Event) {
    const event = await Event.findOneOrFail(id, {
      relations: ["registeredUsers"],
    });

    return event.registeredUsers.length;
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => [Team])
  async registeredTeam(@Root() { id }: Event) {
    const teams = await Team.find({
      where: { event: id },
      relations: ["members"],
    });
    return teams;
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => Number)
  async registeredTeamCount(@Root() { id }: Event) {
    const count = await Team.count({ where: { event: id } });
    return count;
  }

  @Authorized()
  @FieldResolver(() => Boolean)
  async isRegistered(@Root() { id }: Event, @Ctx() { user }: MyContext) {
    const res = await isRegisteredInEvent(id, user.id);
    return res;
  }

  @Authorized()
  @FieldResolver(() => Team, { nullable: true })
  async yourTeam(@Root() { id }: Event, @Ctx() { user }: MyContext) {
    const event = await Event.findOneOrFail(id, {
      relations: ["registeredTeam"],
    });
    let getTeamID;
    await Promise.all(
      event.registeredTeam?.map(async (team) => {
        const teaM = await Team.findOneOrFail(team.id, {
          relations: ["members"],
          select: ["id", "name"],
        });
        const userF = teaM.members.filter((member) => member.id === user.id);
        if (userF.length === 1) getTeamID = team.id;
      })
    );
    const team = await Team.findOne(getTeamID, { relations: ["members"] });
    if (team) return team;

    return null;
  }

  @FieldResolver(() => [EventFAQ])
  async faqs(@Root() { id }: Event) {
    const eventFAQs = await EventFAQ.find({
      where: { event: id },
      order: { updatedOn: "DESC" },
    });
    return eventFAQs;
  }
}
