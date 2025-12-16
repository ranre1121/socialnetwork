import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./dist/routes/authRoutes.js";
import navbarRoutes from "./dist/routes/navbarRoutes.js";
import friendsRoutes from "./dist/routes/friendsRoutes.js";
import postsRoutes from "./dist/routes/postsRoutes.js";
import profilesRoutes from "./dist/routes/profileRoutes.js";
import prisma from "./prisma.ts";
import messagesRoutes from "./dist/routes/messagesRoutes.js";
import { addMessage } from "./dist/controllers/messagesControllers.js";

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/data", navbarRoutes);
app.use("/posts", postsRoutes);
app.use("/friends", friendsRoutes);
app.use("/profiles", profilesRoutes);
app.use("/messages", messagesRoutes);

const server = http.createServer(app);

app.use("/uploads", express.static("uploads"));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    socket.join(username);
  });

  socket.on("private_message", async (payload) => {
    const newMessage = await addMessage(payload);

    io.to(payload.receiverUsername).emit("private_message", newMessage);
    io.to(payload.senderUsername).emit("private_message", newMessage);
  });

  socket.on("read_message", async (payload) => {
    const { chatId, messageCount, username } = payload;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return;

    const message = await prisma.message.findFirst({
      where: { chatId, countId: messageCount },
      include: {
        sender: true,
        receiver: true,
        chat: true,
      },
    });

    if (!message) return;

    await prisma.userChatRead.upsert({
      where: {
        userId_chatId: {
          userId: user.id,
          chatId,
        },
      },
      update: {
        messagesRead: messageCount,
      },
      create: {
        userId: user.id,
        chatId,
        messagesRead: 0,
      },
    });

    io.to(message.sender.username).emit("read_message", messageCount);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
