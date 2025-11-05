import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from 'generated/prisma';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { LoginUserDto } from 'src/dtos/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  }

  async comparePasswords(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    const areEqual = await bcrypt.compare(password, hashPassword);
    return areEqual;
  }

  async signUp(createUserDto: CreateUserDto): Promise<{
    user: { id: string; email: string; username: string };
    token: string;
  }> {
    const { username, email, password } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashPassword = await this.hashPassword(password);
    const user = await this.prisma.user.create({
      data: { email, username, password: hashPassword },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
        password: false,
      },
    });
    const token = await this.jwtService.signAsync({ id: user.id });
    return { user, token };
  }

  async signIn(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: User; token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const areEqual = await this.comparePasswords(password, user.password);
    if (!areEqual) {
      throw new UnauthorizedException('Invalid credentials');
    }
    delete (user as any).password;
    const token = await this.jwtService.signAsync({ id: user.id });
    return { user, token };
  }
}
