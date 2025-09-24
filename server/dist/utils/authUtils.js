import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, "../..//data/users.json");
export const loadUsers = () => {
  if (!fs.existsSync(usersFile)) return;
  const data = fs.readFileSync(usersFile, "utf-8");
  return JSON.parse(data);
};
export const saveUser = (users) => {
  if (!fs.existsSync(usersFile)) return;
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};
//# sourceMappingURL=authUtils.js.map
