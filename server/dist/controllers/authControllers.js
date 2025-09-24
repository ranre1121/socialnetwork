import bcrypt from "bcryptjs";
import { loadUsers, saveUser } from "../utils/authUtils.js";
export function registerUser(req, res) {
    const users = loadUsers();
    const { username, password } = req.body;
    if (users.find((u) => u.username === username)) {
        return res.status(400).json({ msg: "Username is taken" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    saveUser(users);
    res.status(200).json(newUser);
}
//# sourceMappingURL=authControllers.js.map