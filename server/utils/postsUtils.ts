import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Post } from "../types/types.ts"; // define a Post type similar to your addPost structure

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFile = path.join(__dirname, "../../data/posts.json");

// Load all posts
export const loadPosts = (): Post[] => {
  if (!fs.existsSync(postsFile)) return [];
  const data = fs.readFileSync(postsFile, "utf-8");
  return JSON.parse(data);
};

// Save posts array back to the file
export const savePosts = (posts: Post[]) => {
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
};
