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
exports.ChatGateway = void 0;
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const prisma_service_1 = require("../prisma/prisma.service");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const messages_service_1 = require("../messages/messages.service");
let ChatGateway = class ChatGateway {
    jwtService;
    prismaService;
    messagesService;
    server;
    connectedUsers = new Map();
    roomPresence = new Map();
    constructor(jwtService, prismaService, messagesService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
        this.messagesService = messagesService;
    }
    afterInit(_) {
        console.log('WebSocket Gateway initialized and ready! 🚀');
    }
    async handleConnection(client) {
        const token = client.handshake.auth.token || client.handshake.query.token;
        if (!token) {
            client.disconnect();
            return;
        }
        try {
            const decode = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            const { id } = decode;
            const existingSockets = this.connectedUsers.get(id);
            if (existingSockets) {
                existingSockets.push(client);
                this.connectedUsers.set(id, existingSockets);
            }
            else {
                this.connectedUsers.set(id, [client]);
            }
            client.data.userId = id;
            console.log(`User ${id} connected successfully`);
            const userSockets = this.connectedUsers.get(id);
            if (userSockets?.length === 1) {
                this.server.emit('user_online', { userId: id });
                const onlineUserIds = Array.from(this.connectedUsers.keys());
                client.emit('online_users_list', { userIds: onlineUserIds });
            }
        }
        catch (error) {
            client.emit('error', { message: 'Invalid token' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        const existingSockets = this.connectedUsers.get(userId);
        const filterSockets = existingSockets?.filter((socket) => socket.id !== client.id);
        if (filterSockets?.length === 0) {
            this.connectedUsers.delete(userId);
            this.server.emit('user_offline', { userId });
        }
        else if (filterSockets && filterSockets?.length > 0) {
            this.connectedUsers.set(userId, filterSockets);
        }
        console.log(`User ${userId} disconnected`);
    }
    async handleJoinRoom(client, roomId) {
        const userId = this.checkUserId(client);
        await this.checkUserIsMember(client, roomId, userId);
        client.join(roomId);
        let roomSet = this.roomPresence.get(roomId);
        if (!roomSet) {
            roomSet = new Set();
        }
        roomSet?.add(userId);
        this.roomPresence.set(roomId, roomSet);
        const currentOnlineMembers = Array.from(roomSet);
        client.emit('room_members_online', { members: currentOnlineMembers });
        this.server.to(roomId).emit('user-joined-room', { userId });
        client.emit('room_joined', {
            message: `Client joined room number ${roomId}`,
        });
        this.server.to(roomId).emit('user_joined', { userId });
    }
    async handleLeaveRoom(client, roomId) {
        const userId = this.checkUserId(client);
        client.leave(roomId);
        const roomSet = this.roomPresence.get(roomId);
        if (roomSet) {
            roomSet?.delete(userId);
            if (roomSet?.size === 0) {
                this.roomPresence.delete(roomId);
            }
            else {
                this.roomPresence.set(roomId, roomSet);
            }
            this.server.to(roomId).emit('user-left-room', { userId });
        }
        client.emit('room_left', {
            message: `Client left room number ${roomId}`,
        });
        this.server
            .to(roomId)
            .emit('user_left', { message: `User ${userId} left room ${roomId}` });
    }
    async handleMessage(client, payload) {
        const { roomId, body: { content }, } = payload;
        const userId = this.checkUserId(client);
        await this.checkUserIsMember(client, roomId, userId);
        const message = await this.messagesService.create(roomId, userId, content);
        this.server.to(roomId).emit('new_message', message);
    }
    async handleStartTyping(client, roomId) {
        const userId = this.checkUserId(client);
        client.to(roomId).emit('user_start_typing', { roomId, userId });
    }
    async handleStopTyping(client, roomId) {
        const userId = this.checkUserId(client);
        client.to(roomId).emit('user_stopped_typing', { roomId, userId });
    }
    checkUserId(client) {
        const userId = client.data.userId;
        if (!userId) {
            throw new common_1.UnauthorizedException('Token not present');
        }
        return userId;
    }
    async checkUserIsMember(client, roomId, userId) {
        const isUserRoomMember = await this.prismaService.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId } },
        });
        if (!isUserRoomMember) {
            client.emit('error', { message: 'Not a member of this room' });
            throw new common_1.UnauthorizedException('Not a member of this room');
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleStartTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleStopTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        messages_service_1.MessagesService])
], ChatGateway);
