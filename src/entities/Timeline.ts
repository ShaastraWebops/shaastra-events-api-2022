import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Event } from "./Event";

@Entity("Timeline")
@ObjectType("Timeline")
export class Timeline extends BaseEntity {
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

    @Column("timestamptz")
    @Field()
    time : string;

    @ManyToOne(()=>Event,(events)=> events.timings)
    event : Event

}