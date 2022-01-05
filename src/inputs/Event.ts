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

  @Field(() => RegistraionType, { nullable: true })
  registrationType: RegistraionType;

  @Field({ nullable: true })
  teamSize: number;
}

@InputType("AddTimingsInput")
export class AddTimingsInput {
  @Field()
  name: string;

  @Field()
  time: string;
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

  @Field(() => RegistraionType, { nullable: true })
  registrationType: RegistraionType;

  @Field({ nullable: true })
  teamSize: number;
}

@InputType("TShirtsDetails")
export class TShirtsDetails {
  @Field()
  address: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  pincode: string;

  @Field()
  shirt: string;

  @Field()
  size: string;
}
