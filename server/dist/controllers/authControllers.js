import bcrypt from "bcryptjs";
import jwt, {} from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../prisma.js";
dotenv.config();
export async function registerUser(req, res) {
    const { username, password, name } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await prisma.user.create({
        data: {
            username,
            name,
            password: hashedPassword,
            bio: "",
        },
    });
    res.status(200).json(newUser);
}
export async function loginUser(req, res) {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return res.status(400).json({ msg: "User was not found" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ msg: "Invalid password" });
    }
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    const publicUser = { username: user.username, name: user.name };
    return res.status(200).json({
        token,
        user: publicUser,
    });
}
//# sourceMappingURL=authControllers.js.map