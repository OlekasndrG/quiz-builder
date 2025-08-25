// pages/create.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../services/api";

/** ==== Schemas ==== */
const OptionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
});

const OptionsArraySchema = z
  .array(OptionSchema)
  .min(2, "Add at least 2 options")
  .superRefine((opts, ctx) => {
    if (!opts.some((o) => o.isCorrect)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mark at least one correct option" });
    }
    const uniq = new Set(opts.map((o) => o.text.trim().toLowerCase()));
    if (uniq.size !== opts.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Options must be unique" });
    }
  });

const BooleanQuestionSchema = z.object({
  text: z.string().trim().min(1, "Question is required"),
  type: z.literal("BOOLEAN"),
  order: z.number().int().nonnegative().optional(),
  // Приймемо true/false як boolean (радіо нижче ставить саме boolean)
  correct: z.boolean({ required_error: "Select True or False" }),
});

const InputQuestionSchema = z.object({
  text: z.string().trim().min(1, "Question is required"),
  type: z.literal("INPUT"),
  order: z.number().int().nonnegative().optional(),
  correctText: z.string().trim().min(1, "Enter correct text"),
});

const CheckboxQuestionSchema = z.object({
  text: z.string().trim().min(1, "Question is required"),
  type: z.literal("CHECKBOX"),
  order: z.number().int().nonnegative().optional(),
  options: OptionsArraySchema,
});

const QuestionSchema = z.discriminatedUnion("type", [
  BooleanQuestionSchema,
  InputQuestionSchema,
  CheckboxQuestionSchema,
]);

const FormSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  questions: z.array(QuestionSchema).min(1, "Add at least one question"),
});

type FormValues = z.infer<typeof FormSchema>;

/** ==== Page ==== */
export default function CreateQuizPage() {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      questions: [{ text: "", type: "BOOLEAN", order: 0, correct: true } as any],
    },
  });

  const qFA = useFieldArray({ control, name: "questions" });

  const onSubmit = async (data: FormValues) => {
    // (Необов’язково) нормалізуємо payload
    const payload = {
      title: data.title.trim(),
      questions: data.questions.map((q, i) => {
        const base = { text: q.text.trim(), type: q.type, order: i };
        if (q.type === "BOOLEAN") return { ...base, correct: q.correct };
        if (q.type === "INPUT") return { ...base, correctText: q.correctText.trim() };
        return {
          ...base,
          options: q.options.map((o) => ({ text: o.text.trim(), isCorrect: !!o.isCorrect })),
        };
      }),
    };
    await api.post("/quizzes", payload);
    window.location.href = "/quizzes";
  };

  const handleTypeChange = (index: number, next: "BOOLEAN" | "INPUT" | "CHECKBOX") => {
    setValue(`questions.${index}.type`, next);
    if (next === "CHECKBOX") {
      const curr = watch(`questions.${index}.options`);
      if (!curr || curr.length < 2) {
        setValue(`questions.${index}.options`, [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ] as any);
      }
      setValue(`questions.${index}.correct`, undefined as any);
      setValue(`questions.${index}.correctText`, undefined as any);
    }
    if (next === "BOOLEAN") {
      setValue(`questions.${index}.correct`, true);
      setValue(`questions.${index}.options`, undefined as any);
      setValue(`questions.${index}.correctText`, undefined as any);
    }
    if (next === "INPUT") {
      setValue(`questions.${index}.correctText`, "");
      setValue(`questions.${index}.options`, undefined as any);
      setValue(`questions.${index}.correct`, undefined as any);
    }
  };

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create Quiz</h1>
        <Link className="btn" href="/quizzes">
          Back to list
        </Link>
      </div>

      <form className="card" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="label">Quiz title</label>
          <input className="input" {...register("title")} placeholder="My first quiz" />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div className="space-y-6">
          {qFA.fields.map((field, index) => {
            const type = watch(`questions.${index}.type`);
            return (
              <div key={field.id} className="border rounded p-4">
                <div className="flex items-start justify-between">
                  <div className="font-semibold">Question #{index + 1}</div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => qFA.remove(index)}
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3">
                  <label className="label">Question text</label>
                  <input
                    className="input"
                    {...register(`questions.${index}.text` as const)}
                    placeholder="e.g., React is a library?"
                  />
                  {errors.questions?.[index]?.text && (
                    <p className="text-red-600 text-sm mt-1">
                      {(errors.questions?.[index]?.text as any)?.message}
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <label className="label">Type</label>
                  <select
                    className="select"
                    value={type}
                    onChange={(e) =>
                      handleTypeChange(index, e.target.value as "BOOLEAN" | "INPUT" | "CHECKBOX")
                    }
                  >
                    <option value="BOOLEAN">Boolean</option>
                    <option value="INPUT">Input</option>
                    <option value="CHECKBOX">Checkbox</option>
                  </select>
                </div>

                {type === "BOOLEAN" && (
                  <div className="mt-3">
                    <label className="label">Correct value</label>
                    <Controller
                      control={control}
                      name={`questions.${index}.correct` as const}
                      render={({ field }) => (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                            />
                            True
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                            />
                            False
                          </label>
                        </div>
                      )}
                    />
                    {/* {errors.questions?.[index]?.correct && (
                      <p className="text-red-600 text-sm mt-1">
                        {(errors.questions?.[index]?.correct as any)?.message}
                      </p>
                    )} */}
                  </div>
                )}

                {type === "INPUT" && (
                  <div className="mt-3">
                    <label className="label">Correct text</label>
                    <input
                      className="input"
                      placeholder="Correct answer"
                      {...register(`questions.${index}.correctText` as const)}
                    />
                    {/* {errors.questions?.[index]?.correctText && (
                      <p className="text-red-600 text-sm mt-1">
                        {(errors.questions?.[index]?.correctText as any)?.message}
                      </p>
                    )} */}
                  </div>
                )}

                {type === "CHECKBOX" && (
                  <CheckboxOptionsEditor
                    control={control}
                    qIndex={index}
                    register={register}
                    errors={errors}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            className="btn"
            onClick={() =>
              qFA.append({
                text: "",
                type: "BOOLEAN",
                order: qFA.fields.length,
                correct: true,
              } as any)
            }
          >
            + Add question
          </button>
          <button className="btn btn-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** ==== Nested options editor for CHECKBOX ==== */
function CheckboxOptionsEditor({
  control,
  qIndex,
  register,
  errors,
}: {
  control: any;
  qIndex: number;
  register: any;
  errors: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${qIndex}.options` as const,
  });

  return (
    <div className="mt-3">
      <label className="label">Options</label>

      <div className="space-y-2">
        {fields.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <input
              className="input"
              placeholder={`Option ${i + 1}`}
              {...register(`questions.${qIndex}.options.${i}.text` as const)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register(`questions.${qIndex}.options.${i}.isCorrect` as const)}
              />
              correct
            </label>
            <button type="button" className="text-red-600" onClick={() => remove(i)}>
              Remove
            </button>
            {errors.questions?.[qIndex]?.options?.[i]?.text && (
              <span className="text-red-600 text-xs">
                {(errors.questions?.[qIndex]?.options?.[i]?.text as any)?.message}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2 items-center">
        <button
          type="button"
          className="btn"
          onClick={() => append({ text: "", isCorrect: false })}
        >
          + Add option
        </button>
        {typeof (errors.questions?.[qIndex] as any)?.options?.message === "string" && (
          <p className="text-red-600 text-sm">
            {(errors.questions?.[qIndex] as any).options.message}
          </p>
        )}
      </div>
    </div>
  );
}
