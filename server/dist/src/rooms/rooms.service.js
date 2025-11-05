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
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoomsService = class RoomsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRoomDto, userId) {
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
    async findAll(userId) {
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
    async findOne(roomId) {
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
    async joinRoom(roomId, userId) {
        const isAlreadyInRoom = await this.prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
        });
        if (isAlreadyInRoom) {
            throw new common_1.BadRequestException('User already in room');
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
    async leaveRoom(roomId, userId) {
        const isAlreadyInRoom = await this.prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
        });
        if (!isAlreadyInRoom) {
            throw new common_1.BadRequestException('Not a member of this room');
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
    async deleteRoom(roomId) {
        await this.prisma.room.delete({
            where: { id: roomId },
        });
        return { message: 'Room deleted successfully' };
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsService);
