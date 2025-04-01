import { API_BASE_URL } from "@/config/api";

/**
 * Typ für eine Task, so wie sie vom Backend geliefert wird.
 * Du kannst das anpassen, falls dein Backend andere Felder hat.
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

/**
 * Daten, die beim Erstellen einer Task vom Frontend ans Backend gesendet werden.
 */
export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
}

/**
 * Holt alle Tasks des eingeloggten Nutzers vom Backend.
 */
export async function getAllTasks(): Promise<Task[]> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}api/tasks`, {
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

/**
 * Erstellt eine neue Task.
 */
export async function createTask(data: CreateTaskDTO): Promise<Task> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}api/tasks`, {
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

/**
 * Aktualisiert eine bestehende Task, z.B. um isCompleted oder andere Felder zu ändern.
 */
export async function updateTask(
  taskId: number,
  updateData: Partial<Task>
): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}api/tasks/${taskId}`, {
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

/**
 * Löscht eine Task.
 */
export async function deleteTask(taskId: number): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}api/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete task.");
  }
}
