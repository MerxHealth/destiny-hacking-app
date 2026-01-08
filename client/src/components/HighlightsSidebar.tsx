import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Highlighter, 
  MessageSquare, 
  Trash2, 
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HighlightsSidebarProps {
  pageNumber: number;
  onClose?: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: "yellow", label: "Yellow", bg: "bg-yellow-200", text: "text-yellow-900" },
  { name: "green", label: "Green", bg: "bg-green-200", text: "text-green-900" },
  { name: "blue", label: "Blue", bg: "bg-blue-200", text: "text-blue-900" },
  { name: "pink", label: "Pink", bg: "bg-pink-200", text: "text-pink-900" },
] as const;

export function HighlightsSidebar({ pageNumber, onClose }: HighlightsSidebarProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedColor, setSelectedColor] = useState<"yellow" | "green" | "blue" | "pink">("yellow");
  const [note, setNote] = useState("");

  const utils = trpc.useUtils();
  
  const { data: highlights, isLoading } = trpc.pdf.listHighlights.useQuery({ 
    pageNumber 
  });
  
  const { data: annotations } = trpc.pdf.listAnnotations.useQuery({ 
    pageNumber 
  });

  const createHighlightMutation = trpc.pdf.createHighlight.useMutation({
    onSuccess: () => {
      utils.pdf.listHighlights.invalidate();
      toast.success("Highlight added!");
      setShowAddDialog(false);
      setSelectedText("");
      setNote("");
    },
    onError: (error) => {
      toast.error(`Failed to add highlight: ${error.message}`);
    },
  });

  const createAnnotationMutation = trpc.pdf.createAnnotation.useMutation({
    onSuccess: () => {
      utils.pdf.listAnnotations.invalidate();
      toast.success("Note added!");
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });

  const deleteHighlightMutation = trpc.pdf.deleteHighlight.useMutation({
    onSuccess: () => {
      utils.pdf.listHighlights.invalidate();
      toast.success("Highlight deleted");
    },
  });

  const handleAddHighlight = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (!text) {
      toast.error("Please select some text first");
      return;
    }
    
    setSelectedText(text);
    setShowAddDialog(true);
  };

  const handleSaveHighlight = () => {
    if (!selectedText) return;
    
    createHighlightMutation.mutate({
      pageNumber,
      selectedText,
      startOffset: 0, // Simplified - not tracking exact position
      endOffset: selectedText.length,
      color: selectedColor,
    });
    
    // If there's a note, create annotation
    if (note.trim()) {
      createAnnotationMutation.mutate({
        pageNumber,
        note: note.trim(),
        contextText: selectedText,
      });
    }
  };

  const getColorClasses = (color: string) => {
    const colorConfig = HIGHLIGHT_COLORS.find(c => c.name === color);
    return colorConfig || HIGHLIGHT_COLORS[0];
  };

  return (
    <>
      <Card className="w-80 h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Highlighter className="h-5 w-5" />
              Highlights
            </CardTitle>
            <CardDescription>Page {pageNumber}</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-auto space-y-4">
          {/* Add Highlight Button */}
          <Button 
            onClick={handleAddHighlight} 
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add Highlight
          </Button>

          {/* Highlights List */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading highlights...
            </p>
          ) : highlights && highlights.length > 0 ? (
            <div className="space-y-3">
              {highlights.map((highlight: any) => {
                const colorClasses = getColorClasses(highlight.color);
                const highlightAnnotations = annotations?.filter(
                  (a: any) => a.contextText === highlight.selectedText
                );
                
                return (
                  <Card key={highlight.id} className="p-3">
                    <div className="space-y-2">
                      {/* Highlighted Text */}
                      <div className={`p-2 rounded ${colorClasses.bg} ${colorClasses.text}`}>
                        <p className="text-sm font-medium line-clamp-3">
                          "{highlight.selectedText}"
                        </p>
                      </div>

                      {/* Color Badge */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {colorClasses.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteHighlightMutation.mutate({ 
                            highlightId: highlight.id 
                          })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Annotations */}
                      {highlightAnnotations && highlightAnnotations.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                          {highlightAnnotations.map((annotation: any) => (
                            <div key={annotation.id} className="flex gap-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground">
                                {annotation.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Highlighter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No highlights on this page yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Select text and click "Add Highlight"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Highlight Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Highlight</DialogTitle>
            <DialogDescription>
              Choose a color and optionally add a note
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selected Text Preview */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Selected text:</p>
              <p className="text-sm text-muted-foreground line-clamp-4">
                "{selectedText}"
              </p>
            </div>

            {/* Color Picker */}
            <div>
              <p className="text-sm font-medium mb-2">Highlight Color:</p>
              <div className="flex gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      selectedColor === color.name
                        ? "border-primary scale-105"
                        : "border-transparent"
                    } ${color.bg} ${color.text}`}
                  >
                    <div className="text-xs font-medium">{color.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div>
              <p className="text-sm font-medium mb-2">Add Note (optional):</p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your thoughts or comments..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedText("");
                  setNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveHighlight}
                disabled={createHighlightMutation.isPending}
              >
                {createHighlightMutation.isPending ? "Saving..." : "Save Highlight"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
