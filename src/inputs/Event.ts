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

    @Field()
    platform: string;

    @Field()
    requirements: string;

    @Field()
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

    @Field()
    eventTimeFrom: string;

    @Field()
    eventTimeTo: string;

    @Field(() => RegistraionType)
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

    @Field()
    platform: string;

    @Field()
    requirements: string;

    @Field()
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

    @Field()
    eventTimeFrom: string;

    @Field()
    eventTimeTo: string;

    @Field(() => RegistraionType)
    registrationType: RegistraionType;

    @Field({ nullable: true })
    teamSize: number;
    
}
