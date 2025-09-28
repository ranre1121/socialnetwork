import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./dist/routes/authRoutes.js";
import navbarRoutes from "./dist/routes/navbarRoutes.js";
import friendsRoutes from "./dist/routes/friendsRoutes.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/data", navbarRoutes);

app.use("/friends", friendsRoutes);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
