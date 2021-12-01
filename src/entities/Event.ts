import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";

@Entity("Event")
@ObjectType("Event")
export class Event extends BaseEntity {
 
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

  @Column()
  @Field()
  vertical: string;

  @Column()
  @Field()
  description: string;

}