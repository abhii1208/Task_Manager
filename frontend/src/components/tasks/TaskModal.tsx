import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock3, Link2, MessageSquareText, Paperclip, PencilLine, SendHorizontal } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Task, TaskPayload } from "../../types/task";
import { STAGE_LABELS } from "../../utils/constants";
import { toDateInputValue } from "../../utils/date";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { TextArea } from "../ui/TextArea";

const stageValues = ["TODO", "IN_PROGRESS", "DONE"] as const;
const priorityValues = ["LOW", "MEDIUM", "HIGH"] as const;

const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional(),
  stage: z.enum(stageValues),
  priority: z.enum(priorityValues),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  tags: z.string().optional()
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type TaskModalProps = {
  open: boolean;
  task: Task | null;
  defaultStage?: Task["stage"];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => Promise<void>;
};

const toTagsArray = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
};

const PRIORITY_OPTIONS: Array<{ value: TaskFormValues["priority"]; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" }
];

export const TaskModal = ({ open, task, defaultStage = "TODO", isSubmitting, onClose, onSubmit }: TaskModalProps) => {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      stage: defaultStage,
      priority: "MEDIUM",
      dueDate: "",
      assignee: "",
      tags: ""
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      stage: task?.stage ?? defaultStage,
      priority: task?.priority ?? "MEDIUM",
      dueDate: task?.dueDate ? toDateInputValue(task.dueDate).slice(0, 10) : "",
      assignee: "John Doe",
      tags: task?.tags.join(", ") ?? ""
    });
  }, [defaultStage, open, task, reset]);

  const selectedPriority = watch("priority");

  const activityItems = useMemo(() => {
    const stageLabel = STAGE_LABELS[task?.stage ?? "IN_PROGRESS"];
    return [
      { id: "1", icon: <Clock3 size={16} />, content: `System updated status to ${stageLabel}`, time: "2 hours ago", tone: "system" as const },
      {
        id: "2",
        icon: <MessageSquareText size={16} />,
        content: "I've added the initial boilerplate for the auth store. Let me know if you need help with API hooks.",
        time: "5h ago",
        tone: "comment" as const
      },
      { id: "3", icon: <Paperclip size={16} />, content: "John Doe attached auth-logic.pdf", time: "Yesterday", tone: "attachment" as const }
    ];
  }, [task?.stage]);

  const submit = handleSubmit(async (values) => {
    const dueDate = values.dueDate ? new Date(values.dueDate).toISOString() : task ? null : undefined;

    await onSubmit({
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      stage: values.stage as Task["stage"],
      priority: values.priority as Task["priority"],
      dueDate,
      tags: toTagsArray(values.tags)
    });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <PencilLine size={20} className="text-brand" />
          <span>{task ? "Edit Task" : "Create Task"}</span>
        </div>
      }
      className="max-w-[960px]"
      contentClassName="!max-h-[calc(90vh-72px)] !overflow-hidden !p-0"
      disableClose={isSubmitting}
    >
      <div className="grid max-h-[calc(90vh-72px)] min-h-[500px] lg:grid-cols-[1.7fr_1fr]">
        <div className="overflow-y-auto p-5 sm:p-6">
          <form className="space-y-4" onSubmit={submit}>
            <Input label="Task Title" placeholder="Implement Redux state for User Auth" error={errors.title?.message} {...register("title")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Status" error={errors.stage?.message} {...register("stage")}>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>

              <div>
                <label className="label-base">Priority</label>
                <div className="grid h-10 grid-cols-3 rounded-xl bg-brand-soft-bg p-1">
                  {PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue("priority", option.value, { shouldValidate: true })}
                      className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
                        selectedPriority === option.value ? "bg-brand text-white shadow-sm" : "text-text-secondary hover:text-brand"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register("dueDate")} />
              <Input label="Assignee" placeholder="John Doe" error={errors.assignee?.message} {...register("assignee")} />
            </div>

            <TextArea
              label="Description"
              placeholder="Add acceptance criteria, blockers, and references..."
              error={errors.description?.message}
              className="min-h-24"
              {...register("description")}
            />

            <Input label="Tags" placeholder="frontend, auth, sprint" hint="Comma-separated tags" {...register("tags")} />

            <div className="flex flex-wrap justify-end gap-3 pt-1">
              <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant={task ? "primary" : "create"} isLoading={isSubmitting} loadingText={task ? "Saving..." : "Creating..."}>
                {task ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </form>
        </div>

        <aside className="hidden border-l border-violet-border bg-[#f5f2ff] lg:flex lg:flex-col">
          <div className="flex items-center gap-2 border-b border-violet-border px-5 py-4">
            <CheckCircle2 size={17} className="text-brand" />
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-text-main">Activity Feed</p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {activityItems.map((item) => (
              <div key={item.id} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  {item.icon}
                </span>

                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-text-main">{item.content}</p>
                  <p className="mt-1 text-[13px] font-medium text-text-muted">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-violet-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 flex-1 items-center rounded-full border border-violet-border bg-white px-3">
                <Link2 size={14} className="text-text-muted" />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="ml-2 w-full border-none bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted"
                />
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-hover"
                aria-label="Send comment"
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
};
