import { Prisma, TaskPriority, TaskStage } from "@prisma/client";
import { Response } from "express";

import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const toDateOrNull = (value?: string | null): Date | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return new Date(value);
};

const getAuthenticatedUserId = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  return req.user.id;
};

const createActivityLog = async (params: {
  userId: string;
  taskId: string;
  action: string;
  message: string;
}): Promise<void> => {
  await prisma.activityLog.create({ data: params });
};

const getTaskByIdForUser = async (taskId: string, userId: string) => {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId
    }
  });
};

export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);

  const {
    search,
    stage,
    priority,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10
  } = req.query as {
    search?: string;
    stage?: TaskStage;
    priority?: TaskPriority;
    sortBy?: "createdAt" | "updatedAt" | "dueDate" | "title" | "priority" | "stage";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  };

  const where: Prisma.TaskWhereInput = {
    userId,
    ...(stage ? { stage } : {}),
    ...(priority ? { priority } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { has: search } }
          ]
        }
      : {})
  };

  const skip = (page - 1) * limit;

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy: [{ [sortBy]: sortOrder }, { createdAt: "desc" }],
      skip,
      take: limit
    }),
    prisma.task.count({ where })
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const task = await getTaskByIdForUser(req.params.id, userId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const {
    title,
    description,
    stage,
    priority,
    dueDate,
    tags
  }: {
    title: string;
    description?: string;
    stage: TaskStage;
    priority: TaskPriority;
    dueDate?: string;
    tags?: string[];
  } = req.body;

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || undefined,
      stage,
      priority,
      dueDate: toDateOrNull(dueDate),
      tags: tags ?? [],
      userId
    }
  });

  await createActivityLog({
    userId,
    taskId: task.id,
    action: "TASK_CREATED",
    message: `Created task "${task.title}"`
  });

  res.status(201).json({
    success: true,
    message: "Task created",
    data: task
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const existing = await getTaskByIdForUser(req.params.id, userId);

  if (!existing) {
    throw new AppError("Task not found", 404);
  }

  const {
    title,
    description,
    stage,
    priority,
    dueDate,
    tags
  }: {
    title?: string;
    description?: string | null;
    stage?: TaskStage;
    priority?: TaskPriority;
    dueDate?: string | null;
    tags?: string[];
  } = req.body;

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(stage !== undefined ? { stage } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(dueDate !== undefined ? { dueDate: toDateOrNull(dueDate) } : {}),
      ...(tags !== undefined ? { tags } : {})
    }
  });

  await createActivityLog({
    userId,
    taskId: task.id,
    action: "TASK_UPDATED",
    message: `Updated task "${task.title}"`
  });

  res.status(200).json({
    success: true,
    message: "Task updated",
    data: task
  });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const existing = await getTaskByIdForUser(req.params.id, userId);

  if (!existing) {
    throw new AppError("Task not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        userId,
        taskId: existing.id,
        action: "TASK_DELETED",
        message: `Deleted task "${existing.title}"`
      }
    });

    await tx.task.delete({
      where: { id: existing.id }
    });
  });

  res.status(200).json({
    success: true,
    message: "Task deleted"
  });
});

export const updateTaskStage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const { stage }: { stage: TaskStage } = req.body;

  const existing = await getTaskByIdForUser(req.params.id, userId);

  if (!existing) {
    throw new AppError("Task not found", 404);
  }

  const task = await prisma.task.update({
    where: { id: existing.id },
    data: { stage }
  });

  await createActivityLog({
    userId,
    taskId: task.id,
    action: "TASK_STAGE_UPDATED",
    message: `Moved task "${task.title}" to ${task.stage}`
  });

  res.status(200).json({
    success: true,
    message: "Task stage updated",
    data: task
  });
});

export const getTaskStatsSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const now = new Date();
  const upcomingBoundary = new Date();
  upcomingBoundary.setDate(upcomingBoundary.getDate() + 7);

  const [totalTasks, todoCount, inProgressCount, doneCount, overdueTasks, upcomingTasks] =
    await prisma.$transaction([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, stage: "TODO" } }),
      prisma.task.count({ where: { userId, stage: "IN_PROGRESS" } }),
      prisma.task.count({ where: { userId, stage: "DONE" } }),
      prisma.task.count({
        where: {
          userId,
          stage: { not: "DONE" },
          dueDate: { lt: now }
        }
      }),
      prisma.task.count({
        where: {
          userId,
          stage: { not: "DONE" },
          dueDate: { gte: now, lte: upcomingBoundary }
        }
      })
    ]);

  const completionRate = totalTasks === 0 ? 0 : Number(((doneCount / totalTasks) * 100).toFixed(2));

  res.status(200).json({
    success: true,
    data: {
      totalTasks,
      todoCount,
      inProgressCount,
      doneCount,
      completionRate,
      overdueTasks,
      upcomingTasks
    }
  });
});

export const getRecentActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const { limit = 10 } = req.query as { limit?: number };

  const activities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      task: {
        select: {
          id: true,
          title: true,
          stage: true,
          priority: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: activities
  });
});
