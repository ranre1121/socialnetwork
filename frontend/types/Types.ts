type User = {
  username: string;
  name: string;
  id: number;
  profilePicture: string;
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
  image: string;
  profileOwner: boolean;
  profilePicture: string;
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
    profilePicture: string;
  };
  comments: string[];
  commentsCount: number;
  likesCount: number;
  liked: boolean;
};

type Message = {
  id: number;
  sender: string;
  receiver: string;
  content: string;
  sentAt: string;
  status: "sent" | "received";
};

type Conversation = {
  companion: { username: string; name: string; profilePicture: string };
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
