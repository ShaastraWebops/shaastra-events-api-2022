import { Field, InputType } from "type-graphql";

@InputType("CreateTeamInput")
export class CreateTeamInput {
    @Field()
    name: string;

    @Field(() => [String], { nullable: true })
    members: string[];

    @Field()
    eventID: string;
}