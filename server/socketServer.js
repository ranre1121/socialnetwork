// server.ts
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { addMessage } from "./utils/messagesUtils.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join user’s private room by username
  socket.on("join", (username) => {
    socket.join(username);
    console.log(`${username} joined their room`);
  });

  // listen for private messages
  socket.on("private_message", ({ sender, receiver, content }) => {
    const newMessage = addMessage(sender, receiver, content); // ✅ saves to JSON

    // send to receiver
    io.to(receiver).emit("private_message", newMessage);

    // echo back to sender
    io.to(sender).emit("private_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
