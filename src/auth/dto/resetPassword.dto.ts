import { PickType } from "@nestjs/mapped-types";
import SignupDTO from "./signup.dto";

export default class ResetPasswordDTO extends PickType(SignupDTO, ["email" as const]) { }