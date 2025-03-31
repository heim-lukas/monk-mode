import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTimeBlock } from "@/services/timeblocks";
import { TimeBlock } from "@/types/types";

interface AddTimeBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (newBlock: TimeBlock) => void;
}

export const AddTimeBlockDialog: React.FC<AddTimeBlockDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [timeBlock, setTimeBlock] = useState<Omit<TimeBlock, "id">>({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    isFocus: false,
    tasks: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setTimeBlock((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setError(null); // Reset previous errors

    if (
      !validateTime(timeBlock.startTime) ||
      !validateTime(timeBlock.endTime)
    ) {
      setError("Invalid time format. Use HH:mm:ss.");
      return;
    }

    if (!isStartBeforeEnd(timeBlock.startTime, timeBlock.endTime)) {
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
      const newBlock = await createTimeBlock(token, timeBlock);
      onSave(newBlock);
      resetForm(); // reset form on save
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create time block."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTimeBlock({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      isFocus: false,
      tasks: [],
    });
  };

  const validateTime = (time: string) => {
    return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time); // Enforce HH:mm:ss
  };

  const isStartBeforeEnd = (startTime: string, endTime: string) => {
    return startTime < endTime; // Works since times are in HH:mm:ss format
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Time Block</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-4">
          <Input
            name="title"
            value={timeBlock.title}
            onChange={handleChange}
            placeholder="Title"
          />
          <Input
            name="date"
            type="date"
            min={getTodayDate()}
            value={timeBlock.date}
            onChange={handleChange}
          />
          <Input
            name="startTime"
            value={timeBlock.startTime}
            onChange={handleChange}
            placeholder="Start Time (HH:mm:ss)"
            pattern="([01]\d|2[0-3]):([0-5]\d):([0-5]\d)"
            title="Enter time in HH:mm:ss format"
          />

          <Input
            name="endTime"
            value={timeBlock.endTime}
            onChange={handleChange}
            placeholder="End Time (HH:mm:ss)"
            pattern="([01]\d|2[0-3]):([0-5]\d):([0-5]\d)"
            title="Enter time in HH:mm:ss format"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isFocus"
              checked={timeBlock.isFocus}
              onChange={handleChange}
            />
            <span className="ml-2">Is Focus</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
