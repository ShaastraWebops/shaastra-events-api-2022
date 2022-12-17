import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";

@Entity("BlitzChess")
@ObjectType("BlitzChess")
export class BlitzChess extends BaseEntity {
  @BeforeInsert()
  setId() {
    this.id = cuid();
  }

  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  username: string;

  @Column({nullable : true})
  @Field({nullable : true})
  rating: string;

  @Column({nullable : true})
  @Field({nullable : true})
  title: string;

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

  @OneToOne(() => User, (user) => user.chessDetails)
  @JoinColumn()
  @Field(()=> User)
  user: User;
}
