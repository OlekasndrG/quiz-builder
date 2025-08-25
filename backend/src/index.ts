import cors from "cors";
import "dotenv/config";
import express from "express";
import { quizzesRouter } from "./routes/quizzes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send({ ok: true, message: "Quiz Builder API" });
});

app.use("/quizzes", quizzesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
