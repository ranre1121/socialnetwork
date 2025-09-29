type User = {
  username: string;
  password: string;
  name: string;
  surname: string;
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
  surname: string;
  bio: string;
  friendsCount: number;
};

type Post = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
};

export type { User, Post, Friend, Profile };
