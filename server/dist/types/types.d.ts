type User = {
    id: number;
    username: string;
    password: string;
    name: string;
    createdAt: Date;
};
type Friend = {
    username: string;
    friends: string[];
    requestsSent: string[];
    requestsReceived: string[];
};
type Post = {
    id: number;
    author: string;
    content: string;
    createdAt: string;
    name: string;
};
type Profile = {
    username: string;
    name: string;
    bio: string;
    friendsCount: number;
    profilePic: string;
};
export type { User, Post, Friend, Profile };
//# sourceMappingURL=types.d.ts.map