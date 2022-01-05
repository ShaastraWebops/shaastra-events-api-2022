import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("TShirt")
@ObjectType("TShirt")
export class TShirt extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  shaastraID: string;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  mobile: string;

  @Column()
  @Field()
  address: string;

  @Column()
  @Field()
  city: string;

  @Column()
  @Field()
  state: string;

  @Column()
  @Field()
  pincode: string;

  @Column()
  @Field()
  shirt: string;

  @Column()
  @Field()
  size: string;

  @Column({ type: "boolean", default: false })
  @Field(() => Boolean)
  isPaid: Boolean;

  @Column()
  @Field()
  orderId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  payementId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  paymentSignature: string;
}
