import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";

connectDB();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => res.send("MediGuide API running"));
app.use("/api/auth", authRoutes);
app.use("/api/scans",scanRoutes)

app.listen(process.env.PORT, () =>
  console.log(`Server on port ${process.env.PORT}`)
);