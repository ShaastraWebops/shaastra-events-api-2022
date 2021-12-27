import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
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

    @Column()
    @Field()
    rating : string;

    @Column()
    @Field()
    title : string;

    @OneToOne(() => User, user => user.chessDetails)
    @JoinColumn()
    @Field()
    user : User


}