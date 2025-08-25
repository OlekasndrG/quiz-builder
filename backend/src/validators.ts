import { z } from "zod";

export const QuestionTypeEnum = z.enum(["BOOLEAN", "INPUT", "CHECKBOX"]);

export const OptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean().optional().default(false),
});

const base = z.object({
  text: z.string().min(1),
  type: QuestionTypeEnum,
  order: z.number().int().nonnegative().optional().default(0),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  base.extend({
    type: z.literal("BOOLEAN"),
    correct: z.boolean(),
  }),
  base.extend({
    type: z.literal("INPUT"),
    correctText: z.string().min(1, "Provide correct text"),
  }),
  base.extend({
    type: z.literal("CHECKBOX"),
    options: z.array(OptionSchema).min(2),
  }),
]);

export const CreateQuizSchema = z.object({
  title: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});
