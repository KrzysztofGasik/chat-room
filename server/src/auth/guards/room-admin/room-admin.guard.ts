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
export class RoomAdminGuard implements CanActivate {
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
    console.log(member, member?.role);
    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Only admin can perform this action');
    }
    return true;
  }
}
