import cuid from "cuid";
import { SendTeamConfirmationMail } from "../utils";
import { mail } from "../utils/mail";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Event } from "./Event";
import { User } from "./User";

@Entity("Team")
@ObjectType("Team")
export class Team extends BaseEntity {

    static async sendConfirmationMail({
      name,
      eventname,
      email,
      teamname,
      members
    }: SendTeamConfirmationMail) {
      let memberS = '';
      members.map((member)=>{
        memberS+= member.name + '<br>'
      })
      const body = `Hello <b>${name}</b>,<br><br>
    Your registration for  <strong>${eventname}</strong> is successful <br> Team name : <strong>${teamname}</strong>
    <br>Team members : <br>` + `<strong> ${memberS} </strong>`;
      await mail({ email, sub: "Registration Successful |  Shaastra- 2022", body });
    }

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