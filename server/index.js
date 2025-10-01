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

import { addMessage } from "./dist/utils/messagesUtils.js";

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

// ✅ create one HTTP server and attach socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ✅ socket.io logic
// server.ts (socket part) — copy into your single entry point that creates `server` + `io`

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (username) => {
    socket.join(username);
    console.log(`JOIN: ${username} joined. socket.id=${socket.id}`);
    console.log("socket.rooms:", Array.from(socket.rooms));
  });

  socket.on("private_message", (payload, cb) => {
    console.log("private_message received on server:", payload);

    // persist
    const newMessage = addMessage(
      payload.sender,
      payload.receiver,
      payload.content
    );
    console.log("saved message:", newMessage);

    // emit to both rooms (recipient + sender)
    io.to(payload.receiver).emit("private_message", newMessage);
    io.to(payload.sender).emit("private_message", newMessage);
    console.log("emitted to rooms:", payload.receiver, payload.sender);

    // optional ack for the sender
    if (typeof cb === "function") cb({ ok: true, message: newMessage });
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
