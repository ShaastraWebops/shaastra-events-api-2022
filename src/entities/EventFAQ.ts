import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Event } from "./Event";

@Entity("EventFAQ")
@ObjectType("EventFAQ")
export class EventFAQ extends BaseEntity {
    
    @BeforeInsert()
    setId() {
      this.id = cuid();
    }
      
    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @UpdateDateColumn()
    @Field()
    updatedOn: string;

    @Column()
    @Field()
    question: string;

    @Column()
    @Field()
    answer: string;

    @ManyToOne(() => Event, event => event.faqs, { onDelete : "CASCADE"} )
    event: Event
}