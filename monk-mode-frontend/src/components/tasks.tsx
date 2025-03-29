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

/**
 * Diese Komponente zeigt alle Tasks des Users und ermöglicht:
 * - Neue Task anlegen
 * - Task als erledigt / nicht erledigt markieren
 * - Task löschen
 */
export function Tasks() {
  // Lokaler State, um die Liste aller Tasks zu speichern
  const [tasks, setTasks] = useState<Task[]>([]);

  // Lokale States für die Eingabefelder zum Erstellen einer neuen Task
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Beim ersten Rendern (Mount) rufen wir getAllTasks() auf
  useEffect(() => {
    fetchTasks();
  }, []);

  // Funktion, um alle Tasks vom Backend zu holen und in den State zu packen
  async function fetchTasks() {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  // Funktion zum Erstellen einer neuen Task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault(); // Verhindert Seiten-Reload

    // Erstelle ein Objekt, das nur die optionalen Felder enthält, wenn sie nicht leer sind.
    const taskData: CreateTaskDTO = {
      title,
      description: description.trim() ? description : undefined,
      dueDate: dueDate ? dueDate : undefined,
    };

    try {
      const newTask = await createTask(taskData);

      // Hänge die neue Task an die bestehende Liste
      setTasks([...tasks, newTask]);

      // Leere die Eingabefelder
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  // Funktion, um isCompleted zu togglen
  async function handleToggleComplete(task: Task) {
    try {
      // Wichtig: Wir senden auch den Titel und andere Felder mit, da diese für das Update erforderlich sind.
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted,
      });

      // Aktualisiere den lokalen State
      const updatedTasks = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, isCompleted: !t.isCompleted };
        }
        return t;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // Funktion zum Löschen einer Task
  async function handleDeleteTask(taskId: number) {
    try {
      await deleteTask(taskId);
      // Entferne die Task aus dem lokalen State
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
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a short description"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Due Date (optional)</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
