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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHistory(roomId, limit = 50, cursor) {
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
    async create(roomId, userId, content) {
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
    async markAsRead(roomId, userId) {
        return await this.prisma.roomMember.update({
            where: { roomId_userId: { roomId, userId } },
            data: {
                lastReadAt: new Date(),
            },
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
