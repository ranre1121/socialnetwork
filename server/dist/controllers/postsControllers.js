import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSTS_FILE = path.join(__dirname, "../../data/posts.json");
export const addPost = async (req, res) => {
    try {
        const { author, content } = req.body;
        const postsData = await fs.readFile(POSTS_FILE, "utf-8");
        const posts = JSON.parse(postsData) || [];
        const newPost = {
            id: posts.length ? posts[posts.length - 1].id + 1 : 1,
            author,
            content,
            createdAt: new Date().toISOString(),
        };
        posts.push(newPost);
        await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
        res.status(201).json(newPost);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save post" });
    }
};
//# sourceMappingURL=postsControllers.js.map