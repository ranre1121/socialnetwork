import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const friendsFile = path.join(__dirname, "../../data/friends.json");
// Load all posts
export const loadFriends = () => {
    if (!fs.existsSync(friendsFile))
        return [];
    const data = fs.readFileSync(friendsFile, "utf-8");
    return JSON.parse(data);
};
// Save posts array back to the file
export const saveFriends = (friends) => {
    fs.writeFileSync(friendsFile, JSON.stringify(friends, null, 2));
};
//# sourceMappingURL=friendsUtils.js.map