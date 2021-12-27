import { BlitzChess } from "../entities/BlitzChess";
import { Arg, Authorized, Ctx, Field, FieldResolver, InputType, Mutation, Query, Resolver, Root } from "type-graphql";
import { MyContext } from "../utils/context";
import { User } from "../entities/User";

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

        const details = await BlitzChess.create({ ...data, user}).save();

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


}