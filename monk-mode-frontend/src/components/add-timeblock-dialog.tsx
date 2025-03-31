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
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create time block."
      );
    } finally {
      setLoading(false);
    }
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
            value={timeBlock.date}
            onChange={handleChange}
          />
          <Input
            name="startTime"
            value={timeBlock.startTime}
            onChange={handleChange}
            placeholder="Start Time"
          />
          <Input
            name="endTime"
            value={timeBlock.endTime}
            onChange={handleChange}
            placeholder="End Time"
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
