import { Event } from "../entities/Event";
import {
  AddEventInput,
  AddTimingsInput,
  EditEventInput,
  TShirtsDetails,
} from "../inputs/Event";
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
import EventPay from "../entities/EventPay";
import { UpdateEventPayInput } from "../inputs/EventPay";
import { parse } from "json2csv";
import { getRepository } from "typeorm";
import { Timeline } from "../entities/Timeline";
import dotenv from "dotenv";
import crypto from "crypto";
import { TShirt } from "../entities/TShirts";

dotenv.config();
const axios = require("axios");

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
    var reqdata = JSON.stringify({
      id: event.id,
      name: event.name,
      description: event.description,
    });

    var config = {
      method: "post",
      url: "http://143.110.247.75:5000/events",
      headers: {
        "Content-Type": "application/json",
      },
      data: reqdata,
    };

    await axios(config)
      .then(function (response: any) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error: any) {
        console.log(error);
      });
    return event;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async addTimings(@Arg("data") data: AddTimingsInput, @Arg("id") id: string) {
    const event = await Event.findOne(id, { relations: ["timings"] });

    const timeline = new Timeline();
    timeline.name = data.name;
    timeline.time = data.time;
    await timeline.save();
    if (event?.timings.length === 0) {
      event.timings = [];
    }
    event?.timings.push(timeline);
    await event?.save();

    return true;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteTimings(@Arg("id") id: string) {
    console.log("id", id);
    const { affected } = await Timeline.delete(id);
    return !!affected;
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
  async earlybidoffer(
    @Arg("eventID") id: string,
    @Arg("amount") amount: string
  ) {
    const { affected } = await Event.update(id, { earlybidoffer: amount });

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
    if (
      id === "ckxljoxqa00639bp7gu9o1sz9" &&
      event.registeredUsers.length >= 150
    ) {
      throw new Error("Maximum registrations reached");
    }
    if (event.registrationOpenTime && event.registrationCloseTime) {
      const startDate = new Date(event.registrationOpenTime);
      const currentDate = new Date();
      const endDate = new Date(event.registrationCloseTime);
      if (currentDate.getTime() <= startDate.getTime())
        throw new Error("Registration is not opened yet");
      if (currentDate.getTime() >= endDate.getTime())
        throw new Error("Registration Closed");
      if (event.registrationType === RegistraionType.TEAM)
        throw new Error("Not allowed for individual registration");
    }
    if (!user) throw new Error("Login to Register");
    if (event.registrationType === RegistraionType.NONE)
      throw new Error("Registration for this event is not required");

    const userF = event.registeredUsers.filter((useR) => useR.id === user.id);
    if (userF.length === 1) throw new Error("User registered already");
    if (!event.registrationfee || Number(event.registrationfee) === 0) {
      event.registeredUsers.push(user);
      await event.save();
      await User.sendConfirmationMail({
        name: user.name,
        eventname: event.name,
        email: user.email,
      });
      var data = JSON.stringify({
        userId: user.id,
      });

      var config = {
        method: "post",
        url: `http://143.110.247.75:5000/events/${event.id}/registrations`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      await axios(config)
        .then(function (response: any) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error: any) {
          console.log(error);
        });

      return { registered: !!event };
    } else {
      /* Create the order id */
      let orderId: string = "";

      const currentdate = new Date();
      const deadline = new Date("January 1,2022 23:59:59");

      var options = {
        amount: Number(event.registrationfee) * 100,
        currency: "INR",
        receipt: user.shaastraID + "_" + event.name.slice(0, 24),
      };

      if (
        event.earlybidoffer &&
        deadline.getTime() - currentdate.getTime() > 0
      ) {
        options.amount = Number(event.earlybidoffer) * 100;
      }

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
      await User.sendConfirmationMail({
        name: user.name,
        eventname: event.name,
        email: user.email,
      });
      var reqdata = JSON.stringify({
        userId: user.id,
      });

      var config = {
        method: "post",
        url: `http://143.110.247.75:5000/events/${event.id}/registrations`,
        headers: {
          "Content-Type": "application/json",
        },
        data: reqdata,
      };

      await axios(config)
        .then(function (response: any) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error: any) {
          console.log(error);
        });

      return !!event;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized()
  @Mutation(() => RegisterOutput)
  async ComboOffer(
    @Arg("combo") combo: string,
    @Ctx() { user }: MyContext,
    @Arg("workshopsIDs", () => [String], { nullable: true })
    workshopsID: string[],
    @Arg("TShirtsDetails",{ nullable : true}) tShirtsDetails?: TShirtsDetails
  ) {
    var combodetails;
    if (combo === "AI Combo") {
      combodetails = {
        fee: 1300,
        events: [
          "ckxentwt1000w1up7gi013e4e",
          "ckxekc92m000c1up72t0h4h45",
          "ckxen074m000p1up7bo0q5l17",
        ],
      };
    } else if (combo === "Robotics Combo") {
      combodetails = {
        fee: 1300,
        events: [
          "ckxemw5oi000o2bp77xtg9v0f",
          "ckxf1ihnv003ccup7d2bn7a67",
          "ckxezxg8v0030dbp7e8xq13uw",
        ],
      };
    } else if (combo === "Data Science Combo") {
      combodetails = {
        fee: 1200,
        events: [
          "ckxepglch00122bp7gjk52d0i",
          "ckxenjobj000u1up75tsph890",
          "ckxf22vta003kcup79stiedlw",
        ],
      };
    } else if (combo === "Cybermatic Combo") {
      combodetails = {
        fee: 1200,
        events: [
          "ckxexs6fl002fcup7hcrld72v",
          "ckxey7kfz0029dbp70sqbcovb",
          "ckxewph1e001hcup72ls1hrjx",
        ],
      };
    } else if (combo === "Electronic Combo") {
      combodetails = {
        fee: 1200,
        events: [
          "ckxepp6pj00182bp7h5790jnr",
          "ckxbr05w00004c9p74mji2rgd",
          "ckxen40g6000q2bp7924y6qrm",
        ],
      };
    } else if (combo === "Management Workshops") {
      combodetails = {
        fee: 800,
        events: ["ckxnilxyt000j0bp7d9gp9a7e", "ckxevm6oi000gcup70lp17fa1"],
      };
    } else if (combo === "Mayhem Combo") {
      if (workshopsID.length !== 2) throw new Error("Invalid Registrations");
      combodetails = {
        fee: 1049,
        events: workshopsID,
        shirts: true,
      };
    }
    if (!user) throw new Error("Login to Register");
    var flag = 0;
    await Promise.all(
      combodetails?.events.map(async (eve) => {
        const event = await Event.findOne(eve, {
          relations: ["registeredUsers"],
        });
        const userF = event?.registeredUsers.filter(
          (useR) => useR.id === user.id
        );
        if (userF?.length === 1) {
          flag = 1;
        }
        console.log("Error Here");
      })!
    );
    if (flag) {
      throw new Error("User Already registered in one of the workshop");
    }
    const fee = combodetails?.fee! * 100;
    /* Create the order id */
    let orderId: string = "";

    var options = {
      amount: combodetails?.fee! * 100,
      currency: "INR",
      receipt: user.shaastraID + combo,
    };

    await instance.orders.create(options, function (err: any, order: any) {
      if (err) throw new Error("Order Creation failed. Please Retry");
      orderId = order.id;
    });

    if (orderId === "") throw new Error("Order Creation failed. Please Retry");

    /* Store the details in database */
    await Promise.all(
      combodetails?.events.map(async (eve) => {
        const event = await Event.findOne(eve, {
          relations: ["registeredUsers"],
        });
        await EventPay.create({
          orderId,
          amount: Math.round(Number(options.amount) / 3),
          event,
          user,
        }).save();
      })!
    );
    if (combodetails?.shirts)
      await TShirt.create({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        shaastraID: user.shaastraID,
        orderId,
        ...tShirtsDetails,
      }).save();
    return {
      eventPay: {
        orderId,
        user,
        amount: fee,
      },
    };
  }

  @Authorized()
  @Mutation(() => Boolean)
  async ComboupdateEventPay(
    @Arg("data") data: UpdateEventPayInput,
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
      const eventpay = await EventPay.find({
        where: { orderId: data.orderId },
        relations: ["event"],
      });

      await Promise.all(
        eventpay.map(async (eve) => {
          (eve.isPaid = true),
            (eve.payementId = data.payementId),
            (eve.paymentSignature = data.paymentSignature);
          await eve.save();
        })
      ).catch(() => {
        throw new Error("Update failed");
      });

      const tShirtOrderCount = await TShirt.count({
        where: { orderId: data.orderId },
      });
      if (tShirtOrderCount === 1) {
        const tShirtOrder = await TShirt.findOne({
          where: { orderId: data.orderId },
        });
        tShirtOrder!.payementId = data.payementId;
        tShirtOrder!.paymentSignature = data.paymentSignature;
        tShirtOrder!.isPaid = true;
        await tShirtOrder?.save();
        await User.sendConfirmationMail({
          name: user.name,
          eventname: "t-shirt",
          email: user.email,
        });
      }

      /* Update the user details in registered users */
      await Promise.all(
        eventpay.map(async (eve) => {
          const event = await Event.findOneOrFail(eve.event.id, {
            relations: ["registeredUsers"],
          });
          event.registeredUsers.push(user);
          await event.save();
          await User.sendConfirmationMail({
            name: user.name,
            eventname: event.name,
            email: user.email,
          });
          var reqdata = JSON.stringify({
            userId: user.id,
          });

          var config = {
            method: "post",
            url: `http://143.110.247.75:5000/events/${event.id}/registrations`,
            headers: {
              "Content-Type": "application/json",
            },
            data: reqdata,
          };

          await axios(config)
            .then(function (response: any) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error: any) {
              console.log(error);
            });
        })
      );
      return true;
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
  @Query(() => String)
  async exportCSV(@Arg("EventID") id: string) {
    const event = await Event.findOneOrFail(id);

    const eventRepository = getRepository(Event);

    let csv;
    if (event.registrationType === RegistraionType.INDIVIDUAL) {
      const registeredUsers = await eventRepository
        .createQueryBuilder("event")
        .where("event.id = :eventId", { eventId: id })
        .leftJoinAndSelect("event.registeredUsers", "user")
        .select([
          "user.name",
          "user.email",
          "user.shaastraID",
          "user.mobile",
          "user.college",
          "user.department",
        ])
        .execute();

      csv = parse(registeredUsers);
    } else {
      const registeredTeams = await Team.find({
        where: { event },
        relations: ["members"],
        select: ["name"],
      });
      let csvData = '"team name"';
      const csvHeading =
        ',"name","email","shaastraID","mobile","college","department"';
      for (let i = 0; i < event.teamSize; i++) {
        csvData += csvHeading;
      }

      registeredTeams.map((registeredTeam) => {
        csvData += `\n"${registeredTeam.name}"`;

        registeredTeam.members.map((member) => {
          const { name, email, shaastraID, mobile, college, department } =
            member;
          csvData += `,"${name}","${email}","${shaastraID}","${mobile}","${college}","${department}"`;
        });
      });
      csv = csvData;
    }

    return csv;
  }

  @Authorized(["ADMIN"])
  @Query(() => Number)
  async getPaidUsersCount() {
    return await EventPay.count({ where: { isPaid: true } });
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => [User])
  async registeredUser(@Root() { id }: Event) {
    const event = await Event.findOneOrFail(id, {
      relations: ["registeredUsers"],
    });

    return event.registeredUsers;
  }

  // @Authorized(["ADMIN"])
  @FieldResolver(() => Number)
  async registeredUserCount(@Root() { id }: Event) {
    const event = await Event.findOneOrFail(id, {
      relations: ["registeredUsers"],
    });

    return event.registeredUsers.length;
  }

  @FieldResolver(() => [Timeline])
  async eventtimings(@Root() { id }: Event) {
    const event = await Event.findOneOrFail(id, {
      relations: ["timings"],
    });

    return event.timings;
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

  // @Authorized(["ADMIN"])
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
