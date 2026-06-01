import { DragDropContext, DropResult } from "@hello-pangea/dnd";

import { Task, TaskStage } from "../../types/task";
import { STAGES } from "../../utils/constants";
import { KanbanColumn } from "./KanbanColumn";

type KanbanBoardProps = {
  tasks: Task[];
  onMoveTask: (task: Task, nextStage: TaskStage) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask?: (stage: TaskStage) => void;
  isTaskStageUpdating?: (taskId: string) => boolean;
};

const groupByStage = (tasks: Task[]): Record<TaskStage, Task[]> => {
  const grouped: Record<TaskStage, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: []
  };

  tasks.forEach((task) => {
    grouped[task.stage].push(task);
  });

  STAGES.forEach((stage) => {
    grouped[stage].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  return grouped;
};

export const KanbanBoard = ({ tasks, onMoveTask, onEditTask, onDeleteTask, onCreateTask, isTaskStageUpdating }: KanbanBoardProps) => {
  const groupedTasks = groupByStage(tasks);

  const handleDragEnd = (result: DropResult): void => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return;
    }

    const sourceStage = source.droppableId as TaskStage;
    const movedTask = groupedTasks[sourceStage][source.index];

    if (!movedTask) {
      return;
    }

    if (isTaskStageUpdating?.(movedTask.id)) {
      return;
    }

    onMoveTask(movedTask, destination.droppableId as TaskStage);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            tasks={groupedTasks[stage]}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onCreateTask={onCreateTask}
            isTaskBusy={isTaskStageUpdating}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
