import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket, Server } from 'socket.io';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CreateMessageDto } from 'src/dtos/create-message.dto';
import { MessagesService } from 'src/messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket[]> = new Map();
  private roomPresence: Map<string, Set<string>> = new Map();
  private activeCalls: Map<string, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly messagesService: MessagesService,
  ) {}

  afterInit(_: Server) {
    console.log('WebSocket Gateway initialized and ready! 🚀');
  }

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth.token || (client.handshake.query.token as string);
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
      } else {
        this.connectedUsers.set(id, [client]);
      }

      client.data.userId = id;
      console.log(`User ${id} connected successfully`);

      const userSockets = this.connectedUsers.get(id);
      if (userSockets?.length === 1) {
        // First connection - broadcast online status
        this.server.emit('user_online', { userId: id });
        const onlineUserIds = Array.from(this.connectedUsers.keys());
        client.emit('online_users_list', { userIds: onlineUserIds });
      }
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const existingSockets = this.connectedUsers.get(userId);
    const filterSockets = existingSockets?.filter(
      (socket) => socket.id !== client.id,
    );
    if (filterSockets?.length === 0) {
      this.connectedUsers.delete(userId);
      this.server.emit('user_offline', { userId });

      const calleeId = this.activeCalls.get(userId);
      if (calleeId) {
        // User was the caller
        this.activeCalls.delete(userId);
        const calleeSockets = this.connectedUsers.get(calleeId);
        if (calleeSockets && calleeSockets.length > 0) {
          calleeSockets[0].emit('video_call_ended', {
            endedBy: userId,
            targetUserId: calleeId,
            reason: 'user_disconnected',
          });
        }
      } else {
        // Check if user was the callee
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
    } else if (filterSockets && filterSockets?.length > 0) {
      this.connectedUsers.set(userId, filterSockets);
    }

    console.log(`User ${userId} disconnected`);
  }

  // Messages handlers

  @SubscribeMessage('join_room')
  async handleJoinRoom(client: Socket, roomId: string) {
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

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(client: Socket, roomId: string) {
    const userId = this.checkUserId(client);

    client.leave(roomId);
    const roomSet = this.roomPresence.get(roomId);
    if (roomSet) {
      roomSet?.delete(userId);
      if (roomSet?.size === 0) {
        this.roomPresence.delete(roomId);
      } else {
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

  @SubscribeMessage('send_message')
  async handleMessage(
    client: Socket,
    payload: { roomId: string; body: CreateMessageDto },
  ) {
    const {
      roomId,
      body: { content },
    } = payload;
    const userId = this.checkUserId(client);

    await this.checkUserIsMember(client, roomId, userId);

    const message = await this.messagesService.create(roomId, userId, content);

    this.server.to(roomId).emit('new_message', message);
  }

  @SubscribeMessage('typing_start')
  async handleStartTyping(client: Socket, roomId: string) {
    const userId = this.checkUserId(client);
    client.to(roomId).emit('user_start_typing', { roomId, userId });
  }

  @SubscribeMessage('typing_stop')
  async handleStopTyping(client: Socket, roomId: string) {
    const userId = this.checkUserId(client);
    client.to(roomId).emit('user_stopped_typing', { roomId, userId });
  }

  // helpers

  private checkUserId(client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException('Token not present');
    }
    return userId;
  }

  private async checkUserIsMember(
    client: Socket,
    roomId: string,
    userId: string,
  ) {
    const isUserRoomMember = await this.prismaService.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!isUserRoomMember) {
      client.emit('error', { message: 'Not a member of this room' });
      throw new UnauthorizedException('Not a member of this room');
    }
  }

  // RTC handlers

  @SubscribeMessage('video_call_request')
  async handleVideoCallRequest(
    client: Socket,
    payload: { targetUserId: string },
  ) {
    const { targetUserId } = payload;
    const callerId = this.checkUserId(client);

    if (targetUserId === callerId) {
      client.emit('error', { message: 'Cannot call yourself' });
      throw new BadRequestException('Cannot call yourself');
    }

    const targetSockets = this.connectedUsers.get(targetUserId);

    if (!targetSockets || targetSockets.length === 0) {
      client.emit('error', { message: 'User is not online' });
      throw new BadRequestException('User is not online');
    }

    targetSockets[0].emit('user_request_video_call', { callerId });

    this.activeCalls.set(callerId, targetUserId);

    client.emit('video_call_request_sent', { targetUserId });
  }

  @SubscribeMessage('video_call_answer')
  async handleVideoCallAnswer(
    client: Socket,
    payload: { callerId: string; acceptCall: boolean },
  ) {
    const { callerId, acceptCall } = payload;
    const calleeId = this.checkUserId(client);
    if (this.activeCalls.get(callerId) !== calleeId) {
      client.emit('error', {
        message: 'No active call',
      });
      throw new BadRequestException('No active call');
    }

    const callerSocket = this.connectedUsers.get(callerId);
    if (!callerSocket || callerSocket.length === 0) {
      client.emit('error', {
        message: 'Caller is not online',
      });
      throw new BadRequestException('Caller is not online');
    }
    if (acceptCall) {
      callerSocket[0]?.emit('video_call_accepted', { calleeId });
    } else {
      callerSocket[0]?.emit('video_call_rejected', { calleeId });
      this.activeCalls.delete(callerId);
    }
  }

  @SubscribeMessage('video_call_offer')
  async handleVideoCallOffer(
    client: Socket,
    payload: { targetUserId: string; offer: RTCSessionDescriptionInit },
  ) {
    const { targetUserId, offer } = payload;
    const callerId = this.checkUserId(client);
    if (this.activeCalls.get(callerId) !== targetUserId) {
      client.emit('error', {
        message: 'No active call',
      });
      throw new BadRequestException('No active call');
    }

    const calleeSocket = this.connectedUsers.get(targetUserId);
    if (!calleeSocket || calleeSocket.length === 0) {
      client.emit('error', {
        message: 'Callee is not online',
      });
      throw new BadRequestException('Callee is not online');
    }
    calleeSocket[0].emit('video_call_offer', { callerId, offer });
  }

  @SubscribeMessage('video_call_answer_sdp')
  async handleVideoCallAnswerSdp(
    client: Socket,
    payload: { callerId: string; answer: RTCSessionDescriptionInit },
  ) {
    const { callerId, answer } = payload;
    const calleeId = this.checkUserId(client);
    if (this.activeCalls.get(callerId) !== calleeId) {
      client.emit('error', {
        message: 'No active call',
      });
      throw new BadRequestException('No active call');
    }

    const callerSocket = this.connectedUsers.get(callerId);
    if (!callerSocket || callerSocket.length === 0) {
      client.emit('error', {
        message: 'User is not online',
      });
      throw new BadRequestException('User is not online');
    }
    callerSocket[0].emit('video_call_answer_sdp', { calleeId, answer });
  }

  @SubscribeMessage('video_ice_candidate')
  async handleVideoIceCandidate(
    client: Socket,
    payload: { targetUserId: string; candidate: RTCIceCandidateInit },
  ) {
    const { targetUserId, candidate } = payload;
    const senderId = this.checkUserId(client);
    if (
      this.activeCalls.get(senderId) !== targetUserId &&
      this.activeCalls.get(targetUserId) !== senderId
    ) {
      client.emit('error', {
        message: 'No active call',
      });
      throw new BadRequestException('No active call');
    }

    const targetSocket = this.connectedUsers.get(targetUserId);
    if (!targetSocket || targetSocket.length === 0) {
      client.emit('error', {
        message: 'User is not online',
      });
      throw new BadRequestException('User is not online');
    }
    targetSocket[0].emit('video_ice_candidate', { senderId, candidate });
  }

  @SubscribeMessage('video_call_end')
  async handleVideoCallEnded(
    client: Socket,
    payload: { targetUserId: string },
  ) {
    const { targetUserId } = payload;
    const userId = this.checkUserId(client);
    const isCaller = this.activeCalls.get(userId) === targetUserId;
    const isCallee = this.activeCalls.get(targetUserId) === userId;
    if (!isCaller && !isCallee) {
      client.emit('error', { message: 'No active call' });
      throw new BadRequestException('No active call');
    }
    if (isCaller) {
      this.activeCalls.delete(userId);
    } else {
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
}
