import { loadUsers } from "../utils/authUtils.js";
export function getUsername(req, res) {
    const users = loadUsers();
    const user = users.find((u) => u.username === req.user.username);
    res
        .status(200)
        .json({ username: user.username, name: user.name, surname: user.surname });
}
//# sourceMappingURL=dataController.js.map