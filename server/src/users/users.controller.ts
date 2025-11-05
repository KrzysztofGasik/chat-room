import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from 'src/dtos/update-user.dto';
import { GetUser } from 'src/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('username') username?: string) {
    const users = await this.usersService.findAll(username);
    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }
    return users;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('No user found');
    }
    return user;
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: User,
  ) {
    const userExist = await this.usersService.findOne(id);
    if (!userExist) {
      throw new NotFoundException('No user found');
    }

    if (currentUser.id !== id) {
      throw new ForbiddenException('Cannot update other user');
    }

    return await this.usersService.update(id, updateUserDto);
  }
}
