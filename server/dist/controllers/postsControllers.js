import { loadPosts, savePosts } from "../utils/postsUtils.js";
import { loadUsers } from "../utils/authUtils.js"; // users.json
import { loadFriends } from "../utils/friendsUtils.js"; // friends.json
import prisma from "../prisma.js";
export async function addPost(req, res) {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(400).json("Not authorized");
        const author = await prisma.user.findUnique({
            where: { username },
        });
        if (!author)
            return res.status(404).json({ error: "Author not found" });
        const { content } = req.body;
        const newPost = await prisma.post.create({
            data: {
                author: { connect: { id: author.id } },
                content,
                likes: [],
            },
            include: {
                author: {
                    select: { id: true, name: true, username: true },
                },
            },
        });
        res.status(201).json(newPost);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save post" });
    }
}
export async function getFeedPosts(req, res) {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Get accepted friendships
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [{ requesterId: user.id }, { addresseeId: user.id }],
                status: "ACCEPTED",
            },
        });
        // Extract friend IDs
        const friendIds = friendships.map((f) => f.requesterId === user.id ? f.addresseeId : f.requesterId);
        // Get posts by the user and their friends
        const relevantPosts = await prisma.post.findMany({
            where: {
                authorId: { in: [user.id, ...friendIds] }, // ✅ use authorId, not author
            },
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { id: true, name: true, username: true } }, // ✅ get name too
            },
        });
        res.status(200).json({ relevantPosts });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
}
export const deletePost = (req, res) => {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(401).json({ error: "Unauthorized" });
        const postId = parseInt(req.params.id);
        if (isNaN(postId))
            return res.status(400).json({ error: "Invalid post ID" });
        const posts = loadPosts();
        const postIndex = posts.findIndex((p) => p.id === postId);
        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found" });
        }
        const post = posts[postIndex];
        if (post?.author !== username) {
            return res
                .status(403)
                .json({ error: "You can only delete your own posts" });
        }
        posts.splice(postIndex, 1);
        savePosts(posts);
        res.json({ message: "Post deleted successfully", postId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post" });
    }
};
//# sourceMappingURL=postsControllers.js.map