import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export default class SignupDTO {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @Transform(({ value }) => value.trim())
    name: string

    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string
}