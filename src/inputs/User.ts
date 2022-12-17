import { Field, InputType } from "type-graphql";
import { IsEmail} from "class-validator";
import { UserRole } from "../utils";


@InputType("CreateUserInput")
export class CreateUserInput {
	@Field()
	name: string;

	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;

	@Field()
    mobile: string;

	@Field()
	college: string;

    @Field()
	department: string;

	@Field()
	state: string;

	@Field()
	city: string;

    @Field()
	address: string;
    
}

@InputType("LoginInput")
export class LoginInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;
}

@InputType("EditProfileInput")
export class EditProfileInput {

	@Field({nullable: true})
	name: string;

	@Field({nullable: true})
	@IsEmail()
	email: string;
	
	@Field({nullable: true})
    mobile: string;

	@Field({nullable: true})
	college: string;

    @Field({nullable: true})
	department: string;

	@Field({nullable: true})
	state: string;

	@Field({nullable: true})
	city: string;

    @Field({nullable: true})
	address: string;
	

}

@InputType("RequestForgotPassInput")
export class RequestForgotPassInput {
	@Field()
	@IsEmail()
	email: string;
}

@InputType("ResetPasswordInput")
export class ResetPasswordInput {
	@Field()
    email : string

    @Field()
    otp : string

	@Field()
	newPassword: string;
}


@InputType("GetUsersFilter")
export class GetUsersFilter {
	@Field({ nullable: true })
	city: string;

	@Field({ nullable: true })
	school: string;

	@Field({ nullable: true })
	role: UserRole;
}
