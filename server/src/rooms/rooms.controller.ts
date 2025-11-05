import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CreateRoomDto } from 'src/dtos/create-room.dto';
import { RoomsService } from './rooms.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { RoomAdminGuard } from 'src/auth/guards/room-admin/room-admin.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createRoomDto: CreateRoomDto, @GetUser() user: User) {
    return await this.roomsService.create(createRoomDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('userId') userId?: string) {
    return await this.roomsService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.roomsService.findOne(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async join(@Param('id') id: string, @GetUser() user: User) {
    return await this.roomsService.joinRoom(id, user.id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leave(@Param('id') id: string, @GetUser() user: User) {
    return await this.roomsService.leaveRoom(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoomAdminGuard)
  async remove(@Param('id') id: string) {
    return await this.roomsService.deleteRoom(id);
  }
}
