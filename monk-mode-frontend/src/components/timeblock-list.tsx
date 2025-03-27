import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  deleteTimeBlock,
  getTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
} from "@/services/timeblocks";
import { ConfirmDialog } from "./confirm-dialog";
import { TimeBlockDataDialog } from "./timeblock-data-dialog";
import { TimeBlock } from "@/types/types";

export function TimeblockList() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlock | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeBlocks();
  }, []);

  const fetchTimeBlocks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const data = await getTimeBlocks(token);

      const sortedData = data.sort(
        (a: TimeBlock, b: TimeBlock) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setTimeBlocks(sortedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch time blocks."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setConfirmDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      await deleteTimeBlock(token, deletingId);
      setTimeBlocks(timeBlocks.filter((block) => block.id !== deletingId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete time block."
      );
    } finally {
      setConfirmDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleEdit = (timeBlock: TimeBlock) => {
    setSelectedTimeBlock(timeBlock);
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTimeBlock(null); // Ensure a new block starts as null
    setEditDialogOpen(true);
  };

  const handleSave = async (updatedBlock: TimeBlock) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      if (!updatedBlock.id) {
        // Create new time block
        await createTimeBlock(token, updatedBlock);
      } else {
        // Update existing time block
        await updateTimeBlock(token, updatedBlock);
      }

      await fetchTimeBlocks(); // 🔥 Ensure the list refreshes correctly
      setEditDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save time block."
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Time Blocks</h2>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4" /> Add Block
        </Button>
      </div>

      {loading && <Skeleton className="h-20 w-full" />}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeBlocks.length > 0 ? (
                  timeBlocks.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell>{block.title}</TableCell>
                      <TableCell>
                        {new Date(block.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{block.startTime}</TableCell>
                      <TableCell>{block.endTime}</TableCell>
                      <TableCell>{block.isFocus ? "✅" : "❌"}</TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(block)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteRequest(block.id!)}
                          disabled={deletingId === block.id}
                        >
                          {deletingId === block.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500"
                    >
                      No time blocks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialog for Deletion */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Time Block"
        description="Are you sure you want to delete this time block?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Reused Edit Dialog for Editing & Adding */}
      <TimeBlockDataDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSave}
        timeBlock={selectedTimeBlock}
      />
    </div>
  );
}
