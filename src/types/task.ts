export interface Task {
  id: number;
  projectId: number;
  title: string;
  assignee?: string;
  status: "todo" | "in-progress" | "done";
  dueDate: string;
  order: number;
}

export type TaskStatus = Task["status"];
