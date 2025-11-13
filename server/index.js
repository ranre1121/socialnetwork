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
import messagesRoutes from "./dist/routes/messagesRoutes.js";
import {
  addMessage,
  readMessage,
} from "./dist/controllers/messagesControllers.js";

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
    const newMessage = await addMessage(
      payload.tempId,
      payload.senderUsername,
      payload.receiverUsername,
      payload.content
    );

    io.to(payload.receiver).emit("private_message", newMessage);
    io.to(payload.sender).emit("private_message", newMessage);
  });

  socket.on("read_message", async (payload) => {
    const readMessage = await readMessage(payload.readerId, payload.messageId);

    io.to(payload.receiver).emit("read_message", readMessage);
  });

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
