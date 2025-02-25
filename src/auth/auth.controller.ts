import { BadRequestException, Body, Controller, Post, Query } from '@nestjs/common';

import { AuthService } from './auth.service';
import SignupDTO from './dto/signup.dto';
import LoginDTO from './dto/login.dto';
import ResetPasswordDTO from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signUp(@Body() signUpData: SignupDTO) {
    return this.authService.signUp(signUpData)
  }

  @Post('login')
  login(@Body() loginData: LoginDTO) {
    return this.authService.login(loginData)
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordData: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordData)
  }

  @Post('verify-reset-password')
  verifyResetPasswordToken(
    @Query('reset-token') resetPasswordToken: string,
    @Body() data: { newPassword: string }
  ) {

    if (!resetPasswordToken || !data.newPassword) {
      throw new BadRequestException("Both 'reset-token' query parameter and 'newPassword' field in the request body are required.");
    }

    return this.authService.verifyResetPasswordToken(resetPasswordToken, data)
  }
}
