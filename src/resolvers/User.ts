import { User } from "../entities/User";
import { Arg, Authorized, Ctx, Field, FieldResolver, Mutation,ObjectType,Query,Resolver, Root} from "type-graphql";
import { CreateUserInput,EditProfileInput,LoginInput, ResetPasswordInput } from "../inputs/User";
import jwt from "jsonwebtoken";
import { MyContext } from "../utils/context";
import bcrypt from "bcryptjs";
import { ADMINMAILLIST, UserRole } from "../utils";
import { Event } from "../entities/Event";


@ObjectType("GetUsersOutput")
class GetUsersOutput {
  @Field(() => [User])
  users: User[];
  
  @Field(() => Number)
  count: Number;
}

@Resolver(User)
export class UserResolver {

    @Mutation(() => Boolean)
    async createUser(@Arg("data") data: CreateUserInput, @Ctx() {res} : MyContext) {
        const count = await User.count();
        var shID = ( "0000" + (count + 1) ).slice(-4);
        const shaastraID = `SHA22${shID}`;
        const user = await User.create({ ...data, shaastraID }).save();

        // const { name, email, id,verificationOTP} = user;
        // await User.sendVerificationMail({ name, email, id, verifyOTP });

        if(ADMINMAILLIST.includes(data.email)){
            const { affected } = await User.update(user?.id, { role: UserRole.ADMIN })
            return affected === 1;
        }
        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret");
        res.cookie("token", token )

        return !!user;
    }

    @Mutation(() => Boolean)
    async verifyUser(@Arg("otp") otp: string,@Ctx() {user} : MyContext) {
      if (user?.verificationOTP !== otp) throw new Error("Invalid OTP!");
      await User.update(user.id, { isVerified: true });
      return !!user;
    }

    // @Mutation(() => Boolean)
    // async resendVerificationMail(@Arg("data") { email }: RequestForgotPassInput) {
    //     const user = await User.findOneOrFail({ where: { email } });
    //     const { name,verificationOTP , isVerified } = user;

    //     if (isVerified) throw new Error("Email has been verified before");

    //     await User.sendVerificationMail({ name, email , verificationOTP });

    //     return true;
    // }



    
    @Mutation(() => Boolean)
    async resetPassword(@Arg("data") { email, otp, newPassword }: ResetPasswordInput) {
        const user = await User.findOneOrFail({ where: {email} });

        if (user.passwordOTP === otp) {
            const password = await bcrypt.hash(newPassword, 13);
            const { affected } = await User.update(user.id, { password });
            return affected === 1
        }else{
          throw new Error("Invalid Otp");
        }
    }

    

    @Mutation(() => Boolean)
    async getPasswordOTP(@Arg("email") email: string) {
      const user = await User.findOneOrFail({ where: { email } });
      if(!user) throw new Error("Email Not found");
      const passwordOTP = User.generateOTP();
      await User.update(user.id, { passwordOTP });

    //   const { name} = user;
    //   await User.sendForgotResetMail({ name, email, verificationOTP : passwordOTP });
      return true;
    }

    @Mutation(() => User, { nullable: true })
    async login(@Arg("data") { email, password }: LoginInput, @Ctx() {res} : MyContext) {
        const user = await User.findOneOrFail({ where: { email} });
        if(!user) throw new Error("Account Not Found");

        // if(!user.isVerified) throw new Error("Oops, email not verified!");

        const checkPass = await bcrypt.compare(password, user?.password);
        if(!checkPass) throw new Error("Invalid Credential");

        let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret");
        res.cookie("token", token )

        return user;
    }

    @Authorized()
    @Query(() => User, { nullable: true })
    async me(@Ctx() { user }: MyContext) {
        return user;
    }

    @Mutation(() => Boolean, { nullable: true })
    async editProfile(@Ctx() { user }: MyContext, @Arg("data") data: EditProfileInput) {
        const { affected } = await User.update(user.id, { ...data })
        return affected === 1;
    }


    @Mutation(() => Boolean)
    async logoutUser(@Ctx() { res }: MyContext) {
        res.cookie("token", "", { httpOnly: true, maxAge: 1 })

        return true;
    }


    @Query(() => GetUsersOutput, { nullable: true })
    async getUsers(
        // @Arg("filter", { nullable: true }) filter: GetUsersFilter,
        // @Arg("skip", { nullable: true }) skip: number,
        // @Arg("limit", { nullable: true }) take: number
        ) {

        const users = await User.find({order: { name: "ASC" } });

        const count = await User.count();
        return { users, count };
    }

    @Query(() => Number)
    async getUsersCount() {
        return await User.count({ where: { isVerified: true } });
    }

    @Authorized()
    @FieldResolver(() => [Event])
    async registeredEvents(@Root() { id }: User ) {
        let { registeredEvents} = await User.findOneOrFail( id, { relations: ["registeredEvents"] } );

        // await Promise.all(teams?.map(async (team) => {
        //     const teaM = await Team.findOneOrFail(team.id, { relations: ["event"] });
        //     registeredEvents.push(teaM.event);
        // }));

        return registeredEvents;
    }


}