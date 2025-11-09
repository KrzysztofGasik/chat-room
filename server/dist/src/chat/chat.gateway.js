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
    activeCalls = new Map();
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
            const calleeId = this.activeCalls.get(userId);
            if (calleeId) {
                this.activeCalls.delete(userId);
                const calleeSockets = this.connectedUsers.get(calleeId);
                if (calleeSockets && calleeSockets.length > 0) {
                    calleeSockets[0].emit('video_call_ended', {
                        endedBy: userId,
                        targetUserId: calleeId,
                        reason: 'user_disconnected',
                    });
                }
            }
            else {
                for (const [callerId, calleeId] of this.activeCalls.entries()) {
                    if (calleeId === userId) {
                        this.activeCalls.delete(callerId);
                        const callerSockets = this.connectedUsers.get(callerId);
                        if (callerSockets && callerSockets.length > 0) {
                            callerSockets[0].emit('video_call_ended', {
                                endedBy: userId,
                                targetUserId: callerId,
                                reason: 'user_disconnected',
                            });
                        }
                        break;
                    }
                }
            }
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
    async handleVideoCallRequest(client, payload) {
        const { targetUserId } = payload;
        const callerId = this.checkUserId(client);
        if (targetUserId === callerId) {
            client.emit('error', { message: 'Cannot call yourself' });
            throw new common_1.BadRequestException('Cannot call yourself');
        }
        const targetSockets = this.connectedUsers.get(targetUserId);
        if (!targetSockets || targetSockets.length === 0) {
            client.emit('error', { message: 'User is not online' });
            throw new common_1.BadRequestException('User is not online');
        }
        targetSockets[0].emit('user_request_video_call', { callerId });
        this.activeCalls.set(callerId, targetUserId);
        client.emit('video_call_request_sent', { targetUserId });
    }
    async handleVideoCallAnswer(client, payload) {
        const { callerId, acceptCall } = payload;
        const calleeId = this.checkUserId(client);
        if (this.activeCalls.get(callerId) !== calleeId) {
            client.emit('error', {
                message: 'No active call',
            });
            throw new common_1.BadRequestException('No active call');
        }
        const callerSocket = this.connectedUsers.get(callerId);
        if (!callerSocket || callerSocket.length === 0) {
            client.emit('error', {
                message: 'Caller is not online',
            });
            throw new common_1.BadRequestException('Caller is not online');
        }
        if (acceptCall) {
            callerSocket[0]?.emit('video_call_accepted', { calleeId });
        }
        else {
            callerSocket[0]?.emit('video_call_rejected', { calleeId });
            this.activeCalls.delete(callerId);
        }
    }
    async handleVideoCallOffer(client, payload) {
        const { targetUserId, offer } = payload;
        const callerId = this.checkUserId(client);
        if (this.activeCalls.get(callerId) !== targetUserId) {
            client.emit('error', {
                message: 'No active call',
            });
            throw new common_1.BadRequestException('No active call');
        }
        const calleeSocket = this.connectedUsers.get(targetUserId);
        if (!calleeSocket || calleeSocket.length === 0) {
            client.emit('error', {
                message: 'Callee is not online',
            });
            throw new common_1.BadRequestException('Callee is not online');
        }
        calleeSocket[0].emit('video_call_offer', { callerId, offer });
    }
    async handleVideoCallAnswerSdp(client, payload) {
        const { callerId, answer } = payload;
        const calleeId = this.checkUserId(client);
        if (this.activeCalls.get(callerId) !== calleeId) {
            client.emit('error', {
                message: 'No active call',
            });
            throw new common_1.BadRequestException('No active call');
        }
        const callerSocket = this.connectedUsers.get(callerId);
        if (!callerSocket || callerSocket.length === 0) {
            client.emit('error', {
                message: 'User is not online',
            });
            throw new common_1.BadRequestException('User is not online');
        }
        callerSocket[0].emit('video_call_answer_sdp', { calleeId, answer });
    }
    async handleVideoIceCandidate(client, payload) {
        const { targetUserId, candidate } = payload;
        const senderId = this.checkUserId(client);
        if (this.activeCalls.get(senderId) !== targetUserId &&
            this.activeCalls.get(targetUserId) !== senderId) {
            client.emit('error', {
                message: 'No active call',
            });
            throw new common_1.BadRequestException('No active call');
        }
        const targetSocket = this.connectedUsers.get(targetUserId);
        if (!targetSocket || targetSocket.length === 0) {
            client.emit('error', {
                message: 'User is not online',
            });
            throw new common_1.BadRequestException('User is not online');
        }
        targetSocket[0].emit('video_ice_candidate', { senderId, candidate });
    }
    async handleVideoCallEnded(client, payload) {
        const { targetUserId } = payload;
        const userId = this.checkUserId(client);
        const isCaller = this.activeCalls.get(userId) === targetUserId;
        const isCallee = this.activeCalls.get(targetUserId) === userId;
        if (!isCaller && !isCallee) {
            client.emit('error', { message: 'No active call' });
            throw new common_1.BadRequestException('No active call');
        }
        if (isCaller) {
            this.activeCalls.delete(userId);
        }
        else {
            this.activeCalls.delete(targetUserId);
        }
        client.emit('video_call_ended', { endedBy: userId, targetUserId });
        const targetSockets = this.connectedUsers.get(targetUserId);
        if (targetSockets && targetSockets.length > 0) {
            targetSockets[0].emit('video_call_ended', {
                endedBy: userId,
                targetUserId,
            });
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
__decorate([
    (0, websockets_1.SubscribeMessage)('video_call_request'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleVideoCallRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('video_call_answer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleVideoCallAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('video_call_offer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleVideoCallOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('video_call_answer_sdp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleVideoCallAnswerSdp", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('video_ice_candidate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleVideoIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('video_call_end'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleVideoCallEnded", null);
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
