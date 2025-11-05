"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let RoomAdminGuard = class RoomAdminGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { user, params } = request;
        const roomId = params.id || params.roomId;
        if (!user || !roomId) {
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        const member = await this.prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId: roomId, userId: user.id } },
        });
        if (!member || member.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admin can perform this action');
        }
        return true;
    }
};
exports.RoomAdminGuard = RoomAdminGuard;
exports.RoomAdminGuard = RoomAdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomAdminGuard);
