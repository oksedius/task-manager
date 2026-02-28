export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee?: string;
  status: "todo" | "in-progress" | "done";
  dueDate: string;
  order: number;
}

export type TaskStatus = Task["status"];
