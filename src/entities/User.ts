import bcrypt from "bcryptjs";
import cuid from "cuid";
import { UserRole } from "../utils/Userrole";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";

registerEnumType( UserRole, { name: "UserRole" } );

@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {
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

  @Column("enum", { enum: UserRole, default: UserRole.USER})
  @Field(() => UserRole)
  role: UserRole;


  // RELATIONS & FOREIGN KEYS

 
}