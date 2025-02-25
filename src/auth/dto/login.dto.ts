import { PickType } from "@nestjs/mapped-types";
import SignupDTO from "./signup.dto";

export default class LoginDTO extends PickType(SignupDTO, ["email", "password"] as const) { }