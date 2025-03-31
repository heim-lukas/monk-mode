import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  Task,
  CreateTaskDTO,
} from "@/services/tasks";

// Diese Hilfsfunktion gibt das heutige Datum im Format YYYY-MM-DD zurück
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();

    // Wenn ein Due Date angegeben wurde, prüfen wir, ob es in der Vergangenheit liegt.
    if (dueDate && new Date(dueDate) < new Date(getTodayDate())) {
      alert("Due Date must be today or in the future.");
      return;
    }

    const taskData: CreateTaskDTO = {
      title,
      description: description.trim() ? description : undefined,
      dueDate: dueDate ? dueDate : undefined,
    };

    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  async function handleToggleComplete(task: Task) {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted,
      });
      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  async function handleDeleteTask(taskId: number) {
    try {
      await deleteTask(taskId);
      const updatedTasks = tasks.filter((t) => t.id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formular zum Erstellen einer neuen Task */}
          <form onSubmit={handleCreateTask} className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter a task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Due Date (optional)
              </label>
              <Input
                type="date"
                value={dueDate}
                // Setzt das Minimum auf das heutige Datum
                min={getTodayDate()}
                onChange={(e) => setDueDate(e.target.value)}
                onInvalid={(e) =>
                  e.currentTarget.setCustomValidity("Due Date must be today or in the future.")
                }
                onInput={(e) => e.currentTarget.setCustomValidity("")}
              />
            </div>
            <Button type="submit">Add Task</Button>
          </form>

          {/* Liste aller vorhandenen Tasks */}
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <div>
                  <p
                    className={`font-medium ${
                      task.isCompleted ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleToggleComplete(task)}
                  >
                    {task.isCompleted ? "Undo" : "Complete"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
