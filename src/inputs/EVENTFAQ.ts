import { Field, InputType } from "type-graphql";

@InputType("CreateEventFAQInput")
export class CreateEventFAQInput {
    @Field()
    question: string;

    @Field()
    answer: string;
}

@InputType("EditEventFAQInput")
export class EditEventFAQInput {
    @Field({ nullable: true })
    question: string;

    @Field({ nullable: true })
    answer: string;
}