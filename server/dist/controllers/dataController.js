import { loadUsers } from "../utils/authUtils.js";
export function getUsername(req, res) {
    const users = loadUsers();
    const username = users.find(
    //@ts-ignore
    (u) => u.username === req.user.username).username;
    res.status(200).json({ username });
}
//# sourceMappingURL=dataController.js.map