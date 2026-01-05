import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GripVertical, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableAxisItemProps {
  axis: {
    id: number;
    leftLabel: string;
    rightLabel: string;
    description: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

function SortableAxisItem({ axis, onEdit, onDelete }: SortableAxisItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: axis.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border rounded-lg"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1">
        <div className="font-medium">
          {axis.leftLabel} ↔ {axis.rightLabel}
        </div>
        {axis.description && (
          <div className="text-sm text-muted-foreground">{axis.description}</div>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AxisManagement() {
  const { data: axes } = trpc.sliders.listAxes.useQuery();
  const utils = trpc.useUtils();

  const [editingAxis, setEditingAxis] = useState<number | null>(null);
  const [deletingAxis, setDeletingAxis] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state for editing/creating
  const [formData, setFormData] = useState({
    leftLabel: "",
    rightLabel: "",
    description: "",
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutations
  const updateAxisMutation = trpc.sliders.updateAxis.useMutation({
    onSuccess: () => {
      utils.sliders.listAxes.invalidate();
      utils.sliders.getLatestStates.invalidate();
      setEditingAxis(null);
      toast.success("Axis updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAxisMutation = trpc.sliders.deleteAxis.useMutation({
    onSuccess: () => {
      utils.sliders.listAxes.invalidate();
      utils.sliders.getLatestStates.invalidate();
      setDeletingAxis(null);
      toast.success("Axis deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createAxisMutation = trpc.sliders.createAxis.useMutation({
    onSuccess: () => {
      utils.sliders.listAxes.invalidate();
      setShowCreateDialog(false);
      setFormData({ leftLabel: "", rightLabel: "", description: "" });
      toast.success("Axis created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reorderMutation = trpc.sliders.reorderAxes.useMutation({
    onSuccess: () => {
      utils.sliders.listAxes.invalidate();
      toast.success("Axes reordered");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && axes) {
      const oldIndex = axes.findIndex((axis) => axis.id === active.id);
      const newIndex = axes.findIndex((axis) => axis.id === over.id);

      const reorderedAxes = arrayMove(axes, oldIndex, newIndex);
      const axisIds = reorderedAxes.map((axis) => axis.id);

      // Optimistically update UI
      utils.sliders.listAxes.setData(undefined, reorderedAxes);

      // Save to backend
      reorderMutation.mutate({ axisIds });
    }
  };

  const handleEdit = (axisId: number) => {
    const axis = axes?.find((a) => a.id === axisId);
    if (axis) {
      setFormData({
        leftLabel: axis.leftLabel,
        rightLabel: axis.rightLabel,
        description: axis.description || "",
      });
      setEditingAxis(axisId);
    }
  };

  const handleSaveEdit = () => {
    if (editingAxis) {
      updateAxisMutation.mutate({
        axisId: editingAxis,
        ...formData,
      });
    }
  };

  const handleCreate = () => {
    createAxisMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (deletingAxis) {
      deleteAxisMutation.mutate({ axisId: deletingAxis });
    }
  };

  if (!axes) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Emotional Axes</CardTitle>
        <CardDescription>
          Drag to reorder, edit labels, or create custom axes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={axes.map((axis) => axis.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {axes.map((axis) => (
                <SortableAxisItem
                  key={axis.id}
                  axis={axis}
                  onEdit={() => handleEdit(axis.id)}
                  onDelete={() => setDeletingAxis(axis.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button onClick={() => setShowCreateDialog(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Axis
        </Button>

        {/* Edit Dialog */}
        <Dialog open={editingAxis !== null} onOpenChange={(open) => !open && setEditingAxis(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Axis</DialogTitle>
              <DialogDescription>
                Update the labels and description for this emotional axis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="leftLabel">Left Label</Label>
                <Input
                  id="leftLabel"
                  value={formData.leftLabel}
                  onChange={(e) => setFormData({ ...formData, leftLabel: e.target.value })}
                  placeholder="e.g., Anxiety"
                />
              </div>
              <div>
                <Label htmlFor="rightLabel">Right Label</Label>
                <Input
                  id="rightLabel"
                  value={formData.rightLabel}
                  onChange={(e) => setFormData({ ...formData, rightLabel: e.target.value })}
                  placeholder="e.g., Calm"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this axis measure?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingAxis(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Axis</DialogTitle>
              <DialogDescription>
                Define a new bipolar emotional dimension
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newLeftLabel">Left Label</Label>
                <Input
                  id="newLeftLabel"
                  value={formData.leftLabel}
                  onChange={(e) => setFormData({ ...formData, leftLabel: e.target.value })}
                  placeholder="e.g., Reactive"
                />
              </div>
              <div>
                <Label htmlFor="newRightLabel">Right Label</Label>
                <Input
                  id="newRightLabel"
                  value={formData.rightLabel}
                  onChange={(e) => setFormData({ ...formData, rightLabel: e.target.value })}
                  placeholder="e.g., Intentional"
                />
              </div>
              <div>
                <Label htmlFor="newDescription">Description (optional)</Label>
                <Textarea
                  id="newDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this axis measure?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Axis</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deletingAxis !== null} onOpenChange={(open) => !open && setDeletingAxis(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Axis?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this emotional axis and all associated calibration history.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
