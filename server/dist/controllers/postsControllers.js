import { loadPosts, savePosts } from "../utils/postsUtils.js";
import { loadUsers } from "../utils/authUtils.js"; // users.json
import { loadFriends } from "../utils/friendsUtils.js"; // friends.json
export const addPost = (req, res) => {
    try {
        const { author, content } = req.body;
        const posts = loadPosts();
        const lastId = posts.length > 0 ? posts[posts.length - 1]?.id ?? 0 : 0;
        const newPost = {
            id: lastId + 1,
            author,
            content,
            createdAt: new Date().toISOString(),
        };
        posts.push(newPost);
        savePosts(posts);
        res.status(201).json(newPost);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save post" });
    }
};
export const getFeedPosts = (req, res) => {
    try {
        const username = req.user?.username;
        if (!username)
            return res.status(401).json({ error: "Unauthorized" });
        const users = loadUsers();
        const friendsData = loadFriends(); // friends, requests
        const posts = loadPosts();
        const currentFriendData = friendsData.find((f) => f.username === username);
        if (!currentFriendData) {
            return res.status(404).json({ error: "User friends not found" });
        }
        const friendUsernames = currentFriendData.friends || [];
        // posts authored by the user OR their friends
        const relevantPosts = posts
            .filter((p) => p.author === username || friendUsernames.includes(p.author))
            .map((p) => {
            const authorInfo = users.find((u) => u.username === p.author);
            return {
                ...p,
                name: authorInfo?.name || "",
            };
        })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        res.json(relevantPosts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};
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