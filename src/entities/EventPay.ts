import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./Event";
import { User } from "./User";

@Entity("EventPay")
@ObjectType("EventPay")
class EventPay extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  amount: number;

  @Column()
  @Field()
  orderId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  payementId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  paymentSignature: string;

  @Column({ type: "boolean", default: false })
  @Field(() => Boolean)
  isPaid: Boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  referralcode: string;
  // Relations
  @ManyToOne(() => Event, (event) => event.eventsPay)
  @Field(() => Event)
  event: Event;

  @ManyToOne(() => Event, (recording) => recording.registerPay)
  @Field(() => Event)
  recording: Event;

  @ManyToOne(() => User, (user) => user.eventsPay)
  @Field(() => User)
  user: User;

  @ManyToOne(() => User, (user) => user.recordingPay)
  @Field(() => User)
  recordingUser: User;
}

export default EventPay;
