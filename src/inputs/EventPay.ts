import { Field, InputType } from "type-graphql";

@InputType("UpdateEventPayInput")
class UpdateEventPayInput {
  @Field()
  orderId: string;

  @Field()
  payementId: string;

  @Field()
  paymentSignature: string;
}

export { UpdateEventPayInput };
