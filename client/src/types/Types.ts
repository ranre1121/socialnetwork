type User = {
  username: string;
  password: string;
  name: string;
};

type Friend = {
  username: string;
  friends: string[];
  requestsSent: string[];
  requestsReceived: string[];
};

type Profile = {
  username: string;
  name: string;
  posts: Post[];
  bio: string;
  friendsCount: number;
  profileOwner: boolean;
};

type Post = {
  id: number;
  content: string;
  likes: any[];
  createdAt: string;
  author: {
    id: number;
    username: string;
    name: string;
  };
};

type Conversation = {
  friendUsername: string;
  friendName: string;
  lastMessage: {
    id: number;
    chatId: number;
    content: string;
    senderId: string;
    receiverId: string;
    sentAt: string;
  };
};

type Message = {
  id: number;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
};

export type { User, Post, Friend, Profile, Message, Conversation };
