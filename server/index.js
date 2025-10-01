// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import authRoutes from "./dist/routes/authRoutes.js";
// import navbarRoutes from "./dist/routes/navbarRoutes.js";
// import friendsRoutes from "./dist/routes/friendsRoutes.js";
// import postsRoutes from "./dist/routes/postsRoutes.js";
// import profilesRoutes from "./dist/routes/profileRoutes.js";
// import messagesRoutes from "./dist/routes/messagesRoutes.js";

// dotenv.config();

// const PORT = process.env.PORT;

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cors());

// app.use("/auth", authRoutes);
// app.use("/data", navbarRoutes);
// app.use("/posts", postsRoutes);
// app.use("/friends", friendsRoutes);
// app.use("/profiles", profilesRoutes);
// app.use("/messages", messagesRoutes);

// app.listen(PORT, () => {
//   console.log(`Listening on ${PORT}`);
// });

// server.ts (make this your single entry point)
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

// ✅ register routes
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
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.join(username);
    console.log(`${username} joined their room`);
  });

  socket.on("private_message", ({ sender, receiver, content }) => {
    const newMessage = addMessage(sender, receiver, content);

    io.to(receiver).emit("private_message", newMessage);
    io.to(sender).emit("private_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
