import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(roomId: string, limit: number = 50, cursor?: string) {
    return await this.prisma.message.findMany({
      where: {
        roomId: roomId,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async create(roomId: string, userId: string, content: string) {
    return await this.prisma.message.create({
      data: {
        roomId: roomId,
        userId: userId,
        content: content,
        createdAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async markAsRead(roomId: string, userId: string) {
    return await this.prisma.roomMember.update({
      where: { roomId_userId: { roomId, userId } },
      data: {
        lastReadAt: new Date(),
      },
    });
  }
}
