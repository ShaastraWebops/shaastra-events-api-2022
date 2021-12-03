import cuid from "cuid";
import { RegistraionType } from "../utils";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Team } from "./Team";
import { User } from "./User";
import { EventFAQ } from "./EventFAQ";

registerEnumType( RegistraionType, { name: "RegistraionType" } );

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

  @Column()
  @Field({ nullable: true })
  requirements: string;

  @Column()
  @Field({ nullable: true })
  platform: string;

  @Column()
  @Field({ nullable: true })
  pic: string;

  @Column("timestamptz", { nullable: true })
  @Field({ nullable: true })
  registrationOpenTime: string;

  @Column("timestamptz", { nullable: true })
  @Field({ nullable: true })
  registrationCloseTime: string;

  @Column("timestamptz")
  @Field()
  eventTimeFrom: string;

  @Column("timestamptz")
  @Field()
  eventTimeTo: string;

  @Column()
  @Field()
  registrationType: RegistraionType;

  @Column({ default: 1 })
  @Field()
  teamSize: number;

  //Relations

  @ManyToOne(() => User, user => user.events)
  user: User;

  @ManyToMany(() => User, (user) => user.registeredEvents)
  @JoinTable()
  registeredUsers: User[];

  @OneToMany(() => Team, (team) => team.event)
  registeredTeam: Team[];

  @OneToMany(() => EventFAQ, faqs => faqs.event)
  faqs: EventFAQ[];



}