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
import { TaskDataDialog } from "./task-data-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Returns today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Compare two tasks by due date (fallback to createdAt if no dueDate)
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from backend
  async function fetchTasks() {
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  // Handle form submit for creating a new task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    // Check due date is valid
    if (dueDate && new Date(dueDate) < new Date(getTodayDate())) {
      alert("Due Date must be today or in the future.");
      return;
    }
    // Prepare task data object
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

  // Handle toggling task complete status
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

  // Handle deleting a task
  async function handleDeleteTask(taskId: number) {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  // Handle save from dialog (create new or update existing task)
  async function handleDialogSave(newTask: Task) {
    try {
      if (newTask.id === 0) {
        // Create new task
        const createdTask = await createTask({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
        });
        setTasks([...tasks, createdTask]);
      } else {
        // Update task (if editing is implemented)
        await updateTask(newTask.id, {
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          isCompleted: newTask.isCompleted,
        });
        setTasks(tasks.map((t) => (t.id === newTask.id ? newTask : t)));
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  }

  // Filter and sort tasks into open and completed lists
  const openTasks = tasks
    .filter((task) => !task.isCompleted)
    .sort(compareTasksByDueDate);
  const completedTasks = tasks
    .filter((task) => task.isCompleted)
    .sort(compareTasksByDueDate);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Tasks</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>+ Add Task</Button>
        </CardHeader>
        <CardContent>
          {/* Tabs for Open and Completed Tasks */}
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

      {/* Task Creation Dialog */}
      <TaskDataDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleDialogSave}
        task={null} // null means a new task
      />
    </div>
  );
}
