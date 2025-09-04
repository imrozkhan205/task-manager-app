export type Priority = "low" | "medium" | "high";

export interface Task{
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    dueDate?:string;
    createdAt: string;
}