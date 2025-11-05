import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from 'src/dtos/create-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto, userId: string) {
    return await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        description: createRoomDto.description,
        createdById: userId,
        createdAt: new Date(),
        roomMember: {
          create: {
            userId,
            role: 'admin',
            joinedAt: new Date(),
            lastReadAt: new Date(),
          },
        },
      },
      include: {
        roomMember: true,
      },
    });
  }

  async findAll(userId?: string) {
    return await this.prisma.room.findMany({
      where: userId ? { roomMember: { some: { userId } } } : {},
      include: {
        createdBy: {
          select: { id: true, username: true, avatar: true },
        },
        _count: { select: { roomMember: true } },
      },
    });
  }

  async findOne(roomId: string) {
    return await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        createdBy: {
          select: { id: true, username: true, avatar: true },
        },
        roomMember: {
          select: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });
  }

  async joinRoom(roomId: string, userId: string) {
    const isAlreadyInRoom = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (isAlreadyInRoom) {
      throw new BadRequestException('User already in room');
    }

    return await this.prisma.roomMember.create({
      data: {
        roomId,
        userId,
        role: 'member',
        joinedAt: new Date(),
        lastReadAt: new Date(),
      },
    });
  }

  async leaveRoom(roomId: string, userId: string) {
    const isAlreadyInRoom = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!isAlreadyInRoom) {
      throw new BadRequestException('Not a member of this room');
    }

    await this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });

    const remainingMembers = await this.prisma.roomMember.count({
      where: { roomId },
    });

    if (remainingMembers === 0) {
      await this.prisma.room.delete({ where: { id: roomId } });
    }

    return { message: 'Room left successfully' };
  }

  async deleteRoom(roomId: string) {
    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { message: 'Room deleted successfully' };
  }
}
