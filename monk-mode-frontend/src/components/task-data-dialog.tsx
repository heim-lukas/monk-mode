import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Task } from "@/services/tasks"; // Import Task type

// Props for the dialog component
interface TaskDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null; // For editing an existing task
}

export const TaskDataDialog: React.FC<TaskDataDialogProps> = ({
  open,
  onClose,
  onSave,
  task,
}) => {
  // Local state for dialog fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Initialize fields when dialog opens (for editing or new task)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      // Show only date part (YYYY-MM-DD) if dueDate exists
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [task]);

  // Save handler (create or update task)
  const handleSave = () => {
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    // Validate: due date must be today or later
    const today = new Date().toISOString().split("T")[0];
    if (dueDate && new Date(dueDate) < new Date(today)) {
      alert("Due Date must be today or in the future.");
      return;
    }

    // Create new task object (ID will be assigned by backend for new tasks)
    const newTask: Task = {
      id: task ? task.id : 0, // 0 as placeholder for new tasks
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      dueDate: dueDate ? dueDate : undefined,
      isCompleted: task ? task.isCompleted : false,
      createdAt: task ? task.createdAt : new Date().toISOString(),
      completedAt: task ? task.completedAt : undefined,
    };

    onSave(newTask);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details of your task."
              : "Create a new task."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
          />
          <Input
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a short description (optional)"
          />
          <Input
            name="dueDate"
            type="date"
            value={dueDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDueDate(e.target.value)}
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity(
                "Due Date must be today or in the future."
              )
            }
            onInput={(e) => e.currentTarget.setCustomValidity("")}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
