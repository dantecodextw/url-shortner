import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt"
import { MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

import SignupDTO from './dto/signup.dto';
import User from './entity/user.entity';
import LoginDTO from './dto/login.dto';
import ResetPasswordDTO from './dto/resetPassword.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    async signUp(signUpData: SignupDTO) {

        signUpData.password = await bcrypt.hash(signUpData.password, 10)

        let newUser = this.userRepo.create(signUpData)
        newUser = await this.userRepo.save(newUser)
        return newUser
    }

    async login(loginData: LoginDTO) {
        const { email, password } = loginData

        const userExist = await this.userRepo.findOne({
            where: { email }
        })

        if (!userExist || !(await bcrypt.compare(password, userExist.password))) {
            throw new UnauthorizedException("Invalid User credentials")
        }

        const token = this.jwtService.sign({ sub: userExist.id })

        return {
            user: { ...userExist, password: undefined },
            accessToken: token
        }
    }

    async resetPassword(resetPasswordData: ResetPasswordDTO) {
        const userExist = await this.userRepo.findOne({
            where: { email: resetPasswordData.email }
        })

        if (!userExist) {
            throw new NotFoundException("User with the entered email does not exist")
        }

        const resetPasswordToken = randomBytes(32).toString('hex')

        userExist.resetPasswordToken = resetPasswordToken
        userExist.resetPasswordTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await this.userRepo.save(userExist)

        return { resetPasswordToken }
    }

    async verifyResetPasswordToken(resetPasswordToken: string, data: { newPassword: string }) {
        const user = await this.userRepo.findOne({
            where: {
                resetPasswordToken,
                resetPasswordTokenExpiresAt: MoreThan(new Date())
            }
        })

        if (!user) throw new BadRequestException('Invalid or expired reset password token.')

        user.password = await bcrypt.hash(data.newPassword, 10)
        user.passwordResetAt = new Date()

        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiresAt = null;

        await this.userRepo.save(user)
        return "Password has been reset successfully"
    }
}
