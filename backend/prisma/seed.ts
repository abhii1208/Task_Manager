import bcrypt from "bcryptjs";
import { PrismaClient, TaskPriority, TaskStage } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@taskflow.app";
const DEMO_PASSWORD = "Password@123";

const demoTasks: Array<{
  title: string;
  description?: string;
  stage: TaskStage;
  priority: TaskPriority;
  tags: string[];
  dueDate?: Date;
}> = [
  {
    title: "Design dashboard wireframes",
    description: "Draft mobile and desktop wireframes for task dashboard.",
    stage: "TODO",
    priority: "HIGH",
    tags: ["design", "ui"],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Implement auth middleware",
    description: "Finalize token parsing and route protection.",
    stage: "IN_PROGRESS",
    priority: "MEDIUM",
    tags: ["backend", "security"],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Deploy staging release",
    description: "Deploy latest build to staging and verify smoke tests.",
    stage: "DONE",
    priority: "LOW",
    tags: ["devops", "release"],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

const main = async (): Promise<void> => {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      passwordHash,
      provider: "credentials",
      role: "USER"
    },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      provider: "credentials",
      role: "USER"
    }
  });

  await prisma.activityLog.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });

  const createdTasks = [] as Array<{ id: string; title: string }>;

  for (const task of demoTasks) {
    const created = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        stage: task.stage,
        priority: task.priority,
        tags: task.tags,
        dueDate: task.dueDate,
        userId: user.id
      }
    });

    createdTasks.push({ id: created.id, title: created.title });
  }

  await prisma.activityLog.createMany({
    data: createdTasks.map((task) => ({
      taskId: task.id,
      userId: user.id,
      action: "TASK_CREATED",
      message: `Seeded task \"${task.title}\"`
    }))
  });

  // eslint-disable-next-line no-console
  console.log("Seed completed successfully.");
  // eslint-disable-next-line no-console
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
};

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });