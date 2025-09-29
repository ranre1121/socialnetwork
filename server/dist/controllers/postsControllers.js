import { loadPosts, savePosts } from "../utils/postsUtils.js";
import { loadUsers } from "../utils/authUtils.js";
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
        const posts = loadPosts();
        const user = users.find((u) => u.username === username);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // Filter posts from user + friends
        const relevantPosts = posts
            .filter((p) => p.author === username || user.friends.includes(p.author))
            .map((p) => {
            const authorInfo = users.find((u) => u.username === p.author);
            return {
                ...p,
                name: authorInfo?.name || "",
                surname: authorInfo?.surname || "",
            };
        });
        res.json(relevantPosts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};
//# sourceMappingURL=postsControllers.js.map