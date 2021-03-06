import bcrypt from "bcryptjs";
import cuid from "cuid";
import {
  SendIndividualConfirmationMail,
  SendVerificationMailOptions,
  UserRole,
} from "../utils";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Team } from "./Team";
import { Event } from "./Event";
import { mail } from "../utils/mail";
import EventPay from "./EventPay";
import { BlitzChess } from "./BlitzChess";

registerEnumType(UserRole, { name: "UserRole" });

@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {
  static async sendVerificationMail({
    name,
    email,
    verificationOTP,
  }: SendVerificationMailOptions) {
    console.log("name", name, email);
    const body = `Hello <b>${name}</b>,<br><br>
    Thanks for signing up!<br><br><p>You verification code is <strong>${verificationOTP}</strong></p>`;
    await mail({
      email,
      sub: "Complete your Verification | Shaastra- 2022",
      body,
    });
  }

  static async sendForgotResetMail({
    name,
    email,
    verificationOTP,
  }: SendVerificationMailOptions) {
    const body = `Hello <b>${name}</b>,<br><br>
  In case you forgot your password,<p>your OTP for reset password is
  <strong>${verificationOTP}</strong></p>`;
    await mail({ email, sub: "Forgot your password  |  Shaastra- 2022", body });
  }
  static async sendConfirmationMail({
    name,
    eventname,
    email,
  }: SendIndividualConfirmationMail) {
    let body = ``;
    if (eventname === "Kick-off 2022") {
      body = `Hello <b>${name}</b>,<br><br>
      Thank you for registering for <strong>${eventname}</strong>.
      To view the problem statement, follow the invitation link to the Kaggle contest <a href="https://www.kaggle.com/t/dab00b0531394dbcb82873db472f46aa">here</a>`;
    } else if (eventname === "t-shirt") {
      body = `Hello <b>${name}</b>,<br><br>
      Your order for  T Shirt is successful`;
    } else {
      body = `Hello <b>${name}</b>,<br><br>
   Your registration for  <strong>${eventname}</strong> is successful`;
    }
    await mail({
      email,
      sub: "Registration Successful |  Shaastra- 2022",
      body,
    });
  }

  static primaryFields = [
    "id",
    "name",
    "email",
    "mobile",
    "college",
    "department",
    "address",
    "isVerified",
    "role",
    "verificationOTP",
  ];

  @BeforeInsert()
  async setId() {
    this.id = cuid();
    this.password = await bcrypt.hash(this.password, 13);
    this.verificationOTP = User.generateOTP();
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // PRIMARY FIELDS

  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  shaastraID: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  @Field()
  mobile: string;

  @Column()
  @Field()
  college: string;

  @Column()
  @Field()
  department: string;

  @Column()
  @Field()
  address: string;

  @Column()
  @Field()
  state: string;

  @Column()
  @Field()
  city: string;

  @Column({ default: false })
  @Field()
  isVerified: boolean;

  @Column()
  password: string;

  @Column()
  @Field()
  verificationOTP: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  passwordOTP: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole)
  role: UserRole;

  @Column({ nullable: true })
  @Field({ nullable: true })
  referralcode: string;

  @Column({ default: false })
  @Field()
  isUsedReferral: boolean;

  // RELATIONS
  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @ManyToMany(() => Event, (event) => event.registeredUsers)
  registeredEvents: Event[];

  @ManyToMany(() => Event, (event) => event.recordingUsers)
  recordingEvents: Event[];

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[];

  @OneToMany(() => EventPay, (eventPay) => eventPay.user)
  eventsPay: EventPay[];

  @OneToMany(() => EventPay, (eventPay) => eventPay.recordingUser)
  recordingPay: EventPay[];

  @OneToOne(() => BlitzChess, (chess) => chess.user, { nullable: true })
  @JoinColumn()
  chessDetails: BlitzChess;
}
