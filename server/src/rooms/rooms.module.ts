import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomAdminGuard } from 'src/auth/guards/room-admin/room-admin.guard';
import { RoomMemberGuard } from 'src/auth/guards/room-member/room-member.guard';

@Module({
  exports: [RoomAdminGuard, RoomMemberGuard],
  imports: [PrismaModule],
  providers: [RoomsService, RoomAdminGuard, RoomMemberGuard],
  controllers: [RoomsController],
})
export class RoomsModule {}
