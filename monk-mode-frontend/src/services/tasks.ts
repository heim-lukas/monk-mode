import { API_BASE_URL } from "@/config/api";
import { Task } from "@/types/types";

// Data sent from the frontend when creating a task.
export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
}

// Fetch all tasks for the logged-in user.
export async function getAllTasks(): Promise<Task[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks.");
  }

  return response.json();
}

// Fetch all incomplete tasks for the logged-in user.
export async function getIncompleteTasks(): Promise<Task[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/tasks/incomplete`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch incomplete tasks.");
  }

  return response.json();
}

// Create a new task.
export async function createTask(data: CreateTaskDTO): Promise<Task> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create task.");
  }

  return response.json();
}

// Update an existing task (e.g., toggle isCompleted or update other fields).
export async function updateTask(
  taskId: number,
  updateData: Partial<Task>
): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Failed to update task.");
  }
}

// Delete a task.
export async function deleteTask(taskId: number): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete task.");
  }
}
