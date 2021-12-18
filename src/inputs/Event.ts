import { RegistraionType } from "../utils";
import { Field, InputType } from "type-graphql";

@InputType("AddEventInput")
export class AddEventInput {

    @Field()
	name: string;

    @Field()
    vertical: string;
  
    @Field()
    description: string;

    @Field({ nullable: true })
    platform: string;

    @Field({ nullable: true })
    requirements: string;

    @Field({ nullable: true })
    pic: string;

    @Field({ nullable: true })
    firstplace: string;

    @Field({ nullable: true })
    secondplace: string;

    @Field({ nullable: true })
    thirdplace: string;

    @Field({ nullable: true })
    participation: string;

    @Field({ nullable: true })
    finalistst: string;

    @Field({ nullable: true })
    registrationfee: string;

    @Field({ nullable: true })
    registrationOpenTime: string;

    @Field({ nullable: true })
    registrationCloseTime: string;

    @Field({ nullable: true })
    eventTimeFrom: string;

    @Field({ nullable: true })
    eventTimeTo: string;

    @Field(() => RegistraionType,{ nullable: true })
    registrationType: RegistraionType;

    @Field({ nullable: true })
    teamSize: number;

    
}

@InputType("EditEventInput")
export class EditEventInput {

    @Field()
	name: string;

    @Field()
    vertical: string;
  
    @Field()
    description: string;

    @Field({ nullable: true })
    platform: string;

    @Field({ nullable: true })
    requirements: string;

    @Field({ nullable: true })
    pic: string;

    @Field({ nullable: true })
    firstplace: string;

    @Field({ nullable: true })
    secondplace: string;

    @Field({ nullable: true })
    thirdplace: string;

    @Field({ nullable: true })
    participation: string;

    @Field({ nullable: true })
    finalistst: string;

    @Field({ nullable: true })
    registrationfee: string;

    @Field({ nullable: true })
    registrationOpenTime: string;

    @Field({ nullable: true })
    registrationCloseTime: string;

    @Field({ nullable: true })
    eventTimeFrom: string;

    @Field({ nullable: true })
    eventTimeTo: string;

    @Field(() => RegistraionType,{ nullable: true })
    registrationType: RegistraionType;

    @Field({ nullable: true })
    teamSize: number;

}
