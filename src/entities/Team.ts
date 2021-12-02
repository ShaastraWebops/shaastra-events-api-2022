import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Event } from "./Event";
import { User } from "./User";

@Entity("Team")
@ObjectType("Team")
export class Team extends BaseEntity {
    @BeforeInsert()
    setId() {
      this.id = cuid();
    }

    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column()
    @Field()
    name: string;

    //relations
    @ManyToMany(() => User, (user) => user.teams)
    @JoinTable()
    @Field(() => [User])
    members: User[];

    @ManyToOne(() => Event, (event) => event.registeredTeam)
    @Field(() => Event)
    event: Event;

}