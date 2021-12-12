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

  // Relations
  @ManyToOne(() => Event, (event) => event.eventsPay)
  @Field(() => Event)
  event: Event;

  @ManyToOne(() => User, (user) => user.eventsPay)
  @Field(() => User)
  user: User;
}

export default EventPay;
