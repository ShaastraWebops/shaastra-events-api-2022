import { Field, InputType } from "type-graphql";

@InputType("AddEventInput")
export class AddEventInput {

    @Field()
	name: string;

    @Field()
    vertical: string;
  
    @Field()
    description: string;
    
}

@InputType("EditEventInput")
export class EditEventInput {

    @Field()
	name: string;

    @Field()
    vertical: string;
  
    @Field()
    description: string;
    
}
