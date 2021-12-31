import { User } from "../entities/User";
export enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
  }

export const ADMINMAILLIST = ["webops@shaastra.org"]

export enum RegistraionType {
  TEAM = "TEAM",
  INDIVIDUAL = "INDIVIDUAL",
  NONE = "NONE"
}

export enum Vertical{
  AEROFEST = "AEROFEST",
  BIOGEN = "BIOGEN",
  BEVENTS = "BEVENTS",
  CL = "CL",
  DB = "DB",
  ELECFEST = "ELECFEST",
  IGNITE = "IGNITE",
  STRATEGISTS = "STRATEGISTS",
  WORKSHOPS = "WORKSHOPS"
}

export interface SendVerificationMailOptions {
  name: string;
  email: string;
  verificationOTP : string;
}

export interface SendIndividualConfirmationMail {
  name: string;
  eventname : string;
  email : string;
}

export interface SendTeamConfirmationMail {
  name: string;
  eventname : string;
  email : string;
  teamname : string;
  members : User[];
}

