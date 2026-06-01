import { z } from "zod";

const stageEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
const sortByEnum = z.enum(["createdAt", "updatedAt", "dueDate", "title", "priority", "stage"]);
const sortOrderEnum = z.enum(["asc", "desc"]);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(2000).optional(),
    stage: stageEnum.default("TODO"),
    priority: priorityEnum.default("MEDIUM"),
    dueDate: z.string().datetime().optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().default([])
  })
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task id")
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(120).optional(),
      description: z.string().trim().max(2000).nullable().optional(),
      stage: stageEnum.optional(),
      priority: priorityEnum.optional(),
      dueDate: z.string().datetime().nullable().optional(),
      tags: z.array(z.string().trim().min(1).max(30)).max(10).optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    })
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task id")
  })
});

export const updateTaskStageSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task id")
  }),
  body: z.object({
    stage: stageEnum
  })
});

export const getTasksQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().max(100).optional(),
    stage: stageEnum.optional(),
    priority: priorityEnum.optional(),
    sortBy: sortByEnum.default("createdAt"),
    sortOrder: sortOrderEnum.default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  })
});

export const taskActivityQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10)
  })
});
