import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateTimeBlock } from "@/services/timeblocks";
import { getIncompleteTasks, Task } from "@/services/tasks"; // Assuming this function fetches tasks
import { TimeBlock } from "@/types/types";

interface EditTimeBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedBlock: TimeBlock) => void;
  timeBlock: TimeBlock;
}

export const EditTimeBlockDialog: React.FC<EditTimeBlockDialogProps> = ({
  open,
  onClose,
  onSave,
  timeBlock,
}) => {
  const [editedTimeBlock, setEditedTimeBlock] = useState(timeBlock);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  useEffect(() => {
    setEditedTimeBlock(timeBlock);
    setSelectedTaskIds(timeBlock.tasks.map((task) => task.id));
    fetchIncompleteTasks();
  }, [timeBlock, open]);

  const fetchIncompleteTasks = async () => {
    try {
      const incompleteTasks = await getIncompleteTasks(); // Fetch incomplete tasks
      setTasks(incompleteTasks);
    } catch (err) {
      setError("Failed to load incomplete tasks.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedTimeBlock((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTaskChange = (taskId: number) => {
    setSelectedTaskIds((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const validateTime = (time: string) => {
    return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time); // Enforce HH:mm:ss
  };

  const isStartBeforeEnd = (startTime: string, endTime: string) => {
    return startTime < endTime; // Works since times are in HH:mm:ss format
  };

  const handleSave = async () => {
    setError(null); // Reset previous errors

    if (
      !validateTime(editedTimeBlock.startTime) ||
      !validateTime(editedTimeBlock.endTime)
    ) {
      setError("Invalid time format. Use HH:mm:ss.");
      return;
    }

    if (!isStartBeforeEnd(editedTimeBlock.startTime, editedTimeBlock.endTime)) {
      setError("Start time must be earlier than end time.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      // Map selected task IDs to task objects
      const selectedTasks = tasks.filter((task) =>
        selectedTaskIds.includes(task.id)
      );

      const updatedTimeBlock = {
        ...editedTimeBlock,
        tasks: selectedTasks, // Use task objects
      };

      await updateTimeBlock(token, updatedTimeBlock);
      onSave(updatedTimeBlock);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update time block."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Time Block</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-4">
          <Input
            name="title"
            value={editedTimeBlock.title}
            onChange={handleChange}
            placeholder="Title"
          />
          <Input
            name="date"
            type="date"
            min={getTodayDate()}
            value={editedTimeBlock.date}
            onChange={handleChange}
          />
          <Input
            name="startTime"
            value={editedTimeBlock.startTime}
            onChange={handleChange}
            placeholder="Start Time (HH:mm:ss)"
            pattern="([01]\d|2[0-3]):([0-5]\d):([0-5]\d)"
            title="Enter time in HH:mm:ss format"
          />
          <Input
            name="endTime"
            value={editedTimeBlock.endTime}
            onChange={handleChange}
            placeholder="End Time (HH:mm:ss)"
            pattern="([01]\d|2[0-3]):([0-5]\d):([0-5]\d)"
            title="Enter time in HH:mm:ss format"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isFocus"
              checked={editedTimeBlock.isFocus}
              onChange={handleChange}
            />
            <span className="ml-2">Is Focus</span>
          </div>

          {/* Task Selection */}
          {tasks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Tasks</h3>
              <ul className="border rounded-lg p-2 mt-2 space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-2 border rounded-md flex justify-between"
                  >
                    <span>{task.title}</span>
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => handleTaskChange(task.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
