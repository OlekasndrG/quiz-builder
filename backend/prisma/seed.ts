
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.quiz.create({
    data: {
      title: "JS Basics",
      questions: {
        create: [
          {
            text: "JavaScript runs in the browser?",
            type: "BOOLEAN",
            order: 0,
            correct: true,
          },
          {
            text: "Type the keyword for constants",
            type: "INPUT",
            order: 1,
            correctText: "const",
          },
          {
            text: "Select React features",
            type: "CHECKBOX",
            order: 2,
            options: {
              create: [
                { text: "Virtual DOM", isCorrect: true },
                { text: "Two-way binding by default", isCorrect: false },
                { text: "JSX", isCorrect: true },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("✅ Seed complete: sample quiz created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
