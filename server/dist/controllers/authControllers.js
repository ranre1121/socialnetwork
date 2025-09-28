import bcrypt from "bcryptjs";
import { loadUsers, saveUser } from "../utils/authUtils.js";
import jwt, {} from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function registerUser(req, res) {
    const users = loadUsers();
    const { username, password, name, surname } = req.body;
    if (users.find((u) => u.username === username)) {
        return res.status(400).json({ msg: "Username is taken" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
        username,
        password: hashedPassword,
        name,
        surname,
        requestsReceived: [],
        requestsSent: [],
        friends: [],
    };
    users.push(newUser);
    saveUser(users);
    res.status(200).json(newUser);
}
export function loginUser(req, res) {
    const users = loadUsers();
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user) {
        return res.status(400).json({ msg: "User was not found" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ msg: "Invalid password" });
    }
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    const { password: _, ...publicUser } = user;
    return res.status(200).json({
        token,
        user: publicUser,
    });
}
//# sourceMappingURL=authControllers.js.map