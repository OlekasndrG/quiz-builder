import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { CreateQuizSchema } from "../validators";

const prisma = new PrismaClient();
export const quizzesRouter = Router();

quizzesRouter.post("/", async (req, res) => {
  const parse = CreateQuizSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const { title, questions } = parse.data;
  try {
    const created = await prisma.quiz.create({
      data: {
        title,
        questions: {
          create: questions.map((q, idx) => ({
            text: q.text,
            type: q.type,
            order: q.order ?? idx,
            correct: q.type === "BOOLEAN" ? q.correct : null,
            correctText: q.type === "INPUT" ? q.correctText : null,
            options:
              q.type === "CHECKBOX"
                ? { create: q.options.map((o) => ({ text: o.text, isCorrect: !!o.isCorrect })) }
                : undefined,
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });
    return res.status(201).json(created);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to create quiz" });
  }
});

quizzesRouter.get("/", async (_req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: { id: true, title: true, _count: { select: { questions: true } } },
      orderBy: { createdAt: "desc" },
    });
    const mapped = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      questionsCount: q._count.questions,
    }));
    return res.json(mapped);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to fetch quizzes" });
  }
});

quizzesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" }, include: { options: true } } },
    });
    if (!quiz) return res.status(404).json({ error: "Not found" });
    return res.json(quiz);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to fetch quiz" });
  }
});

quizzesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    await prisma.quiz.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to delete quiz" });
  }
});
