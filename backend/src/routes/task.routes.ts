import { Router } from "express";

import {
  createTask,
  getRecentActivity,
  getTaskStatsSummary,
  deleteTask,
  getTaskById,
  getTasks,
  updateTaskStage,
  updateTask
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTaskSchema,
  getTasksQuerySchema,
  taskActivityQuerySchema,
  taskIdParamSchema,
  updateTaskStageSchema,
  updateTaskSchema
} from "../schemas/task.schema";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get("/stats/summary", getTaskStatsSummary);
taskRouter.get("/activity/recent", validate(taskActivityQuerySchema), getRecentActivity);
taskRouter.get("/", validate(getTasksQuerySchema), getTasks);
taskRouter.post("/", validate(createTaskSchema), createTask);
taskRouter.patch("/:id/stage", validate(updateTaskStageSchema), updateTaskStage);
taskRouter.get("/:id", validate(taskIdParamSchema), getTaskById);
taskRouter.patch("/:id", validate(updateTaskSchema), updateTask);
taskRouter.delete("/:id", validate(taskIdParamSchema), deleteTask);

export default taskRouter;
