import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/dtos/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() user: CreateUserDto) {
    return await this.authService.signUp(user);
  }

  @Post('signin')
  async signIn(@Body() user: LoginUserDto) {
    return await this.authService.signIn(user);
  }

  @Get('current-user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: User) {
    return user;
  }
}
