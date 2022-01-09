import { BlitzChess } from "../entities/BlitzChess";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";
import { parse } from "json2csv";
import { getRepository } from "typeorm";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import { CapturePaymentChessInput } from "../inputs/BlitzChess";

@InputType("registerBlitzChessInput")
class registerBlitzChessInput {
  @Field()
  username: string;

  @Field()
  rating: string;

  @Field()
  title: string;
}

dotenv.config();

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

@Resolver(BlitzChess)
export class BlitzChessResolver {
  @Authorized()
  @Mutation(() => BlitzChess)
  async registerChess(
    @Arg("data") data: registerBlitzChessInput,
    @Ctx() { user }: MyContext
  ) {
    const chessDetails = await BlitzChess.findOne({
      relations: ["user"],
      where: { user },
    });
    if(data.username === "") throw new Error("Please Enter the Username")
    if(chessDetails?.isPaid) throw new Error("User Already Registered")
    /* Create the order id */
    let orderId: string = "";

    const options = {
      amount: "20000",
      currency: "INR",
      receipt: user.shaastraID + " Blitz Chess",
    };
    await instance.orders.create(options, function (err: any, order: any) {
      if (err) throw new Error("Order Creation failed. Please Retry");
      orderId = order.id;
    });
    if (orderId === "") throw new Error("Order Creation failed. Please Retry");
    if (chessDetails?.user.id){
    await BlitzChess.update(chessDetails.id,{ ...data, orderId, user });
    const details = await BlitzChess.findOne(chessDetails.id);
    return details;
    }else{
    const details = await BlitzChess.create({ ...data, orderId, user }).save();
    user.chessDetails = details;
    await user.save();
    return details;
    }
  }

  @Mutation(() => Boolean)
  async capturePaymentChess(@Arg("Input") data: CapturePaymentChessInput , @Ctx() {user} : MyContext) {
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
      const { affected } = await BlitzChess.update(
        { orderId: data.orderId },
        {
          payementId: data.payementId,
          paymentSignature: data.paymentSignature,
          isPaid: true,
        }
      );
      if(affected === 1){
        await User.sendConfirmationMail({name : user.name,eventname : "Blitz Chess",email : user.email})
      }
      return affected === 1;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  @Authorized(["ADMIN"])
  @Query(() => [BlitzChess])
  async getChessDetails() {
    return await BlitzChess.find();
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => User)
  async user(@Root() { id }: BlitzChess) {
    const chessDetails = await BlitzChess.findOneOrFail(id, {
      relations: ["user"],
    });
    return chessDetails.user;
  }

  
  @Authorized(["ADMIN"])
  @Query(() => String)
  async getChessDetailsCSV() {
    const userRepository = getRepository(User);

    let csv;
    const registeredUsers = await userRepository
      .createQueryBuilder("user")
      .leftJoin(BlitzChess, "chess", "chess.userId = user.id")
      .where("user.chessDetails is not null")
      // .andWhere("chess.isPaid = true")
      .select([
        "user.name",
        "user.shaastraID",
        "user.mobile",
        "user.email",
        "chess.username",
        "chess.rating",
        "chess.title",
        "chess.orderId",
        "chess.payementId",
        "chess.paymentSignature",
        "chess.isPaid",
      ])
      .execute();
    csv = parse(registeredUsers);

    return csv;
  }
}
