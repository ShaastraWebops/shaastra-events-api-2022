import { Field, InputType } from "type-graphql";

@InputType("CapturePaymentChessInput")
class CapturePaymentChessInput {
  @Field()
  orderId: string;

  @Field()
  payementId: string;

  @Field()
  paymentSignature: string;
}

export { CapturePaymentChessInput };
