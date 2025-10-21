type User = {
  username: string;
  name: string;
  id: number;
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
  comments: string[];
  commentsCount: number;
  likesCount: number;
  liked: boolean;
};

type Message = {
  id: number;
  chatId: number;
  content: string;
  senderId: number;
  receiverId: number;
  sentAt: string;
  senderUsername: string;
  receiverUsername: string;
  status: "sent" | "received";
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

type Comment = {
  id: number;
  text: string;
  createdAt: string;
  author: { id: number; username: string; name: string };
  isOwner: boolean;
};

export type { User, Post, Friend, Profile, Message, Conversation, Comment };
