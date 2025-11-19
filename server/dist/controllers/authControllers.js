import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../prisma.js";
dotenv.config();
export async function registerUser(req, res) {
    try {
        const { username, password, name } = req.body;
        if (!username || !password || !name) {
            return res.status(400).json({ msg: "All fields are required" });
        }
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            return res.status(400).json({ msg: "Username already taken" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                name,
                password: hashedPassword,
                bio: "",
                profilePicture: "http://localhost:8000/uploads/profile-placeholder.png",
            },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                createdAt: true,
            },
        });
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
}
export async function loginUser(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ msg: "Username and password are required" });
        }
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ msg: "Invalid password" });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                profilePicture: user.profilePicture,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
}
export async function welcome(req, res) {
    const id = req.user?.id;
    if (!id)
        return res.status(401).json({ error: "Not authorized" });
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user)
        return res.status(404).json({ error: "User was not found" });
    const chats = await prisma.userChatRead.findMany({
        where: { userId: user.id },
    });
    const messageIds = (await Promise.all(chats.map((c) => prisma.chat.findUnique({
        where: { id: c.id },
        select: { lastMessageId: true },
    })))).map((result) => { });
    return res.status(200).json({
        userId: user?.id,
        username: user?.username,
        profilePicture: user?.profilePicture,
        name: user?.name,
        notification: {
            messages: "",
        },
    });
}
//# sourceMappingURL=authControllers.js.map