import { Task } from "@/services";

export interface TimeBlock {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  isFocus: boolean;
  tasks: Task[];
}
