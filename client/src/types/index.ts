export type User = {
  username: string;
  email: string;
  id: string;
  avatar: string | null;
  createdAt: string;
};

export type UserBasic = {
  id: string;
  username: string;
  avatar: string | null;
};

export type Room = {
  id: string;
  createdAt: string;
  name: string;
  description: string | null;
  createdById: string;
  createdBy?: UserBasic;
  roomMember?: Array<{ user: UserBasic }>;
  _count?: {
    roomMember: number;
  };
};

export type Message = {
  id: string;
  createdAt: string;
  content: string;
  roomId: string;
  userId: string;
  user?: UserBasic;
};

export type RoomMember = {
  roomId: string;
  userId: string;
  role: string;
  joinedAt: string;
  lastReadAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type MessagesPageResponse = {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ReactChildren = { children: React.ReactNode };
