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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";


// Hilfsfunktion, die das heutige Datum (YYYY-MM-DD) zurückgibt
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Vergleichsfunktion, um zwei Tasks nach ihrem Due Date zu sortieren.
// Tasks mit einem Due Date werden vorn platziert, fehlende Due Dates landen weiter hinten.
// Falls beide kein Due Date haben, wird nach dem Erstellungsdatum sortiert.
function compareTasksByDueDate(a: Task, b: Task): number {
  if (a.dueDate && b.dueDate) {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  } else if (a.dueDate) {
    return -1;
  } else if (b.dueDate) {
    return 1;
  } else {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }
}

export function Tasks() {
  // Lokaler State für die Task-Liste und Eingabefelder
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Beim ersten Rendern werden die Tasks geladen
  useEffect(() => {
    fetchTasks();
  }, []);

  // Funktion, um Tasks vom Backend zu holen
  async function fetchTasks() {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  // Handler für das Erstellen einer neuen Task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();

    // Validierung: Falls ein Due Date eingegeben wurde, darf es nicht in der Vergangenheit liegen.
    if (dueDate && new Date(dueDate) < new Date(getTodayDate())) {
      alert("Due Date must be today or in the future.");
      return;
    }

    // Erstellen des Task-Datenobjekts – optionale Felder werden nur gesetzt, wenn sie einen Wert haben.
    const taskData: CreateTaskDTO = {
      title,
      description: description.trim() ? description : undefined,
      dueDate: dueDate ? dueDate : undefined,
    };

    try {
      const newTask = await createTask(taskData);
      setTasks([...tasks, newTask]);
      // Felder zurücksetzen
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  // Handler, um den Completion-Status einer Task umzuschalten.
  // Hier senden wir alle erforderlichen Felder, da das Backend den vollständigen Datensatz erwartet.
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

  // Handler zum Löschen einer Task
  async function handleDeleteTask(taskId: number) {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  // Aufteilen der Tasks in offene und abgeschlossene Tasks, jeweils sortiert nach Due Date.
  const openTasks = tasks
    .filter((task) => !task.isCompleted)
    .sort(compareTasksByDueDate);
  const completedTasks = tasks
    .filter((task) => task.isCompleted)
    .sort(compareTasksByDueDate);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formular zur Erstellung einer neuen Task */}
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

          {/* Tabs-Komponente zur Anzeige offener und abgeschlossener Tasks */}
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="open">Open Tasks</TabsTrigger>
              <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
              {openTasks.length > 0 ? (
                <ul className="space-y-2">
                  {openTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
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
                          Complete
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
              ) : (
                <p className="text-center text-muted-foreground">
                  No open tasks.
                </p>
              )}
            </TabsContent>
            <TabsContent value="completed">
              {completedTasks.length > 0 ? (
                <ul className="space-y-2">
                  {completedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <div>
                        <p className="font-medium line-through text-gray-500">
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
                          Undo
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
              ) : (
                <p className="text-center text-muted-foreground">
                  No completed tasks.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
