import { User } from "../entities/User";
import { Arg, Authorized, Ctx, Field, FieldResolver, Mutation,ObjectType,Query,Resolver, Root} from "type-graphql";
import { CreateUserInput,EditProfileInput,GetUsersFilter,LoginInput, RequestForgotPassInput, ResetPasswordInput } from "../inputs/User";
import jwt from "jsonwebtoken";
import { MyContext } from "../utils/context";
import bcrypt from "bcryptjs";
import { ADMINMAILLIST, UserRole } from "../utils";
import { Event } from "../entities/Event";
import { Team } from "../entities/Team";
import { parse } from "json2csv";
import dotenv from "dotenv";

dotenv.config();
const axios = require('axios')


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
        var shID = ( "00000" + (count + 1) ).slice(-5);
        const shaastraID = `SHA22${shID}`;
        const user = await User.create({ ...data, shaastraID }).save();

        const { name, email, verificationOTP} = user;
        await User.sendVerificationMail({ name, email,  verificationOTP });

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
    
      var data = JSON.stringify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "password": user.password
      });
      
      var config = {
        method: 'post',
        url: 'http://143.110.247.75:5000/users/registration',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      await axios(config)
      .then(function (response : any) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error : any) {
        console.log(error);
      });
    
      return !!user;
    }

    @Mutation(() => Boolean)
    async resendVerificationMail(@Arg("data") { email }: RequestForgotPassInput) {
        const user = await User.findOneOrFail({ where: { email } });
        const { name,verificationOTP , isVerified } = user;

        if (isVerified) throw new Error("Email has been verified before");

        await User.sendVerificationMail({ name, email , verificationOTP });

        return true;
    }


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
      const user = await User.findOne({ where: { email } });
      if(!user) throw new Error("Email Not found");
      const passwordOTP = User.generateOTP();
      await User.update(user.id, { passwordOTP });

    const { name} = user;
    await User.sendForgotResetMail({ name, email, verificationOTP : passwordOTP });
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
        res.cookie("token", token ,{ httpOnly: false})

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


    @Authorized(["ADMIN"])
    @Query(() => GetUsersOutput, { nullable: true })
    async getUsers(
        @Arg("filter", { nullable: true }) filter : GetUsersFilter,
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number) {

        const users = await User.find({ where: {...filter}, skip, take, order: { name: "ASC"} });

        const count = await User.count({ where: filter });
        return { users, count };
    }

    @Authorized(["ADMIN"])
    @Query(() => Number)
    async getUsersCount() {
        return await User.count({ where: { role: UserRole.USER , isVerified : true}});
    }

    @Authorized(["ADMIN"])
    @Query(() => String)
    async getUsersDataCSV() {
        const users = await User.find( { where : {role : UserRole.USER , isVerified : true} , select : ["shaastraID","name","email","mobile","college","department","city","state","address"]})
         
        return parse(users);
    }


    @Authorized()
    @FieldResolver(() => [Event])
    async registeredEvents(@Root() { id }: User ) {
        let { registeredEvents, teams} = await User.findOneOrFail( id, { relations: ["registeredEvents", "teams"] } );

        await Promise.all(teams?.map(async (team) => {
            const teaM = await Team.findOneOrFail(team.id, { relations: ["event"] });
            registeredEvents.push(teaM.event);
        }));

        return registeredEvents;
    }


}