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
  author: string;
  content: string;
  createdAt: string;
  name: string;
};

type Conversation = {
  username: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
};

type Message = {
  id: number;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
};

export type { User, Post, Friend, Profile, Message, Conversation };
