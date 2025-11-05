import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RoomMemberGuard } from 'src/auth/guards/room-member/room-member.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from 'src/dtos/create-message.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('rooms/:roomId')
@UseGuards(JwtAuthGuard, RoomMemberGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('messages')
  async getHistory(
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = parseInt(limit || '50', 10);
    const sanitizedLimit = isNaN(parsedLimit) ? 50 : parsedLimit;
    const messages = await this.messagesService.getHistory(
      roomId,
      sanitizedLimit,
      cursor,
    );
    const hasMore = messages.length === sanitizedLimit;
    const nextCursor =
      messages.length > 0
        ? messages[messages.length - 1].createdAt.toISOString()
        : null;

    return { messages, nextCursor, hasMore };
  }

  @Post('messages')
  async create(
    @Param('roomId') roomId: string,
    @GetUser() user: User,
    @Body() body: CreateMessageDto,
  ) {
    return await this.messagesService.create(roomId, user.id, body.content);
  }

  @Patch('read')
  async markAsRead(@Param('roomId') roomId: string, @GetUser() user: User) {
    return await this.messagesService.markAsRead(roomId, user.id);
  }
}
