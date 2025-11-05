import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { UpdateUserDto } from 'src/dtos/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(username?: string) {
    return await this.prisma.user.findMany({
      where: {
        username: username ? { contains: username, mode: 'insensitive' } : {},
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });
  }
}
