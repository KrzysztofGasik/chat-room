import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [PrismaModule, RoomsModule],
  exports: [MessagesService],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
