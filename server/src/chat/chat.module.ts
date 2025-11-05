import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [AuthModule, PrismaModule, MessagesModule],
  providers: [ChatGateway],
})
export class ChatModule {}
