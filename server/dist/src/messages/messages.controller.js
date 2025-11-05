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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth/jwt-auth.guard");
const room_member_guard_1 = require("../auth/guards/room-member/room-member.guard");
const messages_service_1 = require("./messages.service");
const create_message_dto_1 = require("../dtos/create-message.dto");
const get_user_decorator_1 = require("../decorators/get-user.decorator");
let MessagesController = class MessagesController {
    messagesService;
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async getHistory(roomId, limit, cursor) {
        const parsedLimit = parseInt(limit || '50', 10);
        const sanitizedLimit = isNaN(parsedLimit) ? 50 : parsedLimit;
        const messages = await this.messagesService.getHistory(roomId, sanitizedLimit, cursor);
        const hasMore = messages.length === sanitizedLimit;
        const nextCursor = messages.length > 0
            ? messages[messages.length - 1].createdAt.toISOString()
            : null;
        return { messages, nextCursor, hasMore };
    }
    async create(roomId, user, body) {
        return await this.messagesService.create(roomId, user.id, body.content);
    }
    async markAsRead(roomId, user) {
        return await this.messagesService.markAsRead(roomId, user.id);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('messages'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('read'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markAsRead", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('rooms/:roomId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, room_member_guard_1.RoomMemberGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
