import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    const roomId = params.id || params.roomId;
    if (!user || !roomId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: roomId, userId: user.id } },
    });
    if (!member) {
      throw new ForbiddenException('Not a member of this room');
    }
    return true;
  }
}
