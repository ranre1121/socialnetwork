type User = {
  username: string;
  password: string;
  name: string;
  surname: string;
  friends: string[];
  requestsSent: string[];
  requestsReceived: string[];
};

type Post = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
};

export type { User, Post };
