import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TimeBlock } from "@/types/types";
import { updateTimeBlock, createTimeBlock } from "@/services/timeblocks";

interface TimeBlockDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedBlock: TimeBlock) => void;
  timeBlock: TimeBlock | null;
}

export const TimeBlockDataDialog: React.FC<TimeBlockDataDialogProps> = ({
  open,
  onClose,
  onSave,
  timeBlock,
}) => {
  const [editedTimeBlock, setEditedTimeBlock] = useState<
    Omit<TimeBlock, "id"> & { id?: string }
  >({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    isFocus: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timeBlock) {
      setEditedTimeBlock({ ...timeBlock });
    } else {
      setEditedTimeBlock({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        isFocus: false,
      });
    }
  }, [timeBlock]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedTimeBlock((prev) => ({
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
      let savedBlock: TimeBlock;
      if (editedTimeBlock.id) {
        await updateTimeBlock(token, editedTimeBlock);
        savedBlock = editedTimeBlock;
      } else {
        const { id, ...newBlockData } = editedTimeBlock;
        savedBlock = await createTimeBlock(token, newBlockData);
      }

      onSave(savedBlock); // ✅ Pass the updated block
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editedTimeBlock.id ? "Edit Time Block" : "New Time Block"}
          </DialogTitle>
          <DialogDescription>
            {editedTimeBlock.id
              ? "Update the details of your time block."
              : "Create a new time block entry."}
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-4">
          <Input
            name="title"
            value={editedTimeBlock.title}
            onChange={handleChange}
            placeholder="Enter title"
            className="w-full"
          />

          <Input
            name="date"
            value={editedTimeBlock.date}
            onChange={handleChange}
            type="date"
            className="w-full"
          />

          <Input
            name="startTime"
            value={editedTimeBlock.startTime}
            onChange={handleChange}
            placeholder="Enter start time (HH:MM)"
            className="w-full"
          />

          <Input
            name="endTime"
            value={editedTimeBlock.endTime}
            onChange={handleChange}
            placeholder="Enter end time (HH:MM)"
            className="w-full"
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading
              ? "Saving..."
              : editedTimeBlock.id
              ? "Save Changes"
              : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
