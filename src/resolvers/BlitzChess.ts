import { BlitzChess } from "../entities/BlitzChess";
import { Arg, Authorized, Ctx, Field, FieldResolver, InputType, Mutation, Query, Resolver, Root } from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";
import { parse } from "json2csv";
import { getRepository, } from "typeorm";

@InputType("registerBlitzChessInput")
class registerBlitzChessInput{
   
    @Field()
    username : string

    @Field()
    rating : string

    @Field()
    title: string

}

@Resolver(BlitzChess)
export class BlitzChessResolver {

    @Authorized()
    @Mutation(() => Boolean)
    async registerChess(@Arg("data") data : registerBlitzChessInput ,  @Ctx() { user }: MyContext ){

        throw new Error("Registration not Opened yet")
        const chessDetails = await BlitzChess.findOne({relations : ['user'],where : {user}});
        if(chessDetails?.user.id) throw new Error("User Already Registered")
        const details = await BlitzChess.create({ ...data, user}).save();
        user.chessDetails = details;
        await user.save();
        return !!details;
    }

    @Authorized(['ADMIN'])
    @Query(() => [BlitzChess])
    async getChessDetails(){
        return await BlitzChess.find();
    }
  
    @Authorized(['ADMIN'])
    @FieldResolver(()=> User)
    async user(@Root() {id} : BlitzChess){
        const chessDetails = await BlitzChess.findOneOrFail(id,{
            relations : ['user']
        });
        return chessDetails.user
    }

    @Authorized(["ADMIN"])
    @Query(() => String)
  async getChessDetailsCSV() {
      
      const userRepository = getRepository(User);

      let csv;
          const registeredUsers = await userRepository.createQueryBuilder("user")
          .leftJoin(BlitzChess, "chess", "chess.userId = user.id")
          .where('user.chessDetails is not null')
          .select(["user.name","user.shaastraID","user.mobile","user.email","chess.username","chess.rating","chess.title"])
          .execute()
          csv =  parse(registeredUsers);
      
      return csv
  }


}