import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Sowing & Reaping Simulator
 * 
 * AI-powered cause-effect prediction tool.
 * Users describe an action (seed), AI predicts outcomes (harvest).
 * Later, users record actual results and rate AI accuracy.
 */

export default function SowingReaping() {
  const [seedDescription, setSeedDescription] = useState("");
  const [seedDate, setSeedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);

  const { data: entries, isLoading } = trpc.sowingReaping.list.useQuery({ limit: 20 });
  const utils = trpc.useUtils();

  const createEntry = trpc.sowingReaping.create.useMutation({
    onSuccess: () => {
      utils.sowingReaping.list.invalidate();
      setSeedDescription("");
      setShowForm(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedDescription.trim()) return;

    createEntry.mutate({
      seedDescription,
      seedDate,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Sowing & Reaping Simulator</h1>
              <p className="text-muted-foreground">
                Predict outcomes before they happen. Track cause and effect.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Create New Entry */}
        {!showForm ? (
          <Card className="p-8 mb-8 text-center">
            <Sprout className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Plant a Seed</h2>
            <p className="text-muted-foreground mb-6">
              Describe an intentional action you're taking. The AI will predict the likely harvest.
            </p>
            <Button onClick={() => setShowForm(true)} size="lg">
              Create New Entry
            </Button>
          </Card>
        ) : (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">New Seed</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="seedDate">Date</Label>
                <Input
                  id="seedDate"
                  type="date"
                  value={seedDate}
                  onChange={(e) => setSeedDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="seedDescription">What action are you taking? (The Seed)</Label>
                <Textarea
                  id="seedDescription"
                  value={seedDescription}
                  onChange={(e) => setSeedDescription(e.target.value)}
                  placeholder="Example: I'm committing to wake up at 5am every day for 30 days to work on my side project before my day job starts."
                  className="min-h-32"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Be specific. The AI will analyze cause-effect patterns to predict outcomes.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={createEntry.isPending}>
                  {createEntry.isPending ? "Generating Prediction..." : "Generate AI Prediction"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Entries List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Your Seeds & Harvests</h2>
          
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading entries...</p>
            </div>
          )}

          {entries?.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}

          {!isLoading && entries?.length === 0 && !showForm && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No entries yet. Create your first seed to see AI predictions.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface EntryCardProps {
  entry: any;
}

function EntryCard({ entry }: EntryCardProps) {
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [actualHarvest, setActualHarvest] = useState(entry.actualHarvest || "");
  const [outcomeMatch, setOutcomeMatch] = useState<string>(entry.outcomeMatch || "");
  const [userReflection, setUserReflection] = useState(entry.userReflection || "");
  const [accuracyRating, setAccuracyRating] = useState<number>(entry.accuracyRating || 3);

  const utils = trpc.useUtils();
  const recordHarvest = trpc.sowingReaping.recordHarvest.useMutation({
    onSuccess: () => {
      utils.sowingReaping.list.invalidate();
      setShowHarvestForm(false);
    },
  });

  const handleSubmitHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    recordHarvest.mutate({
      entryId: entry.id,
      actualHarvest,
      outcomeMatch: outcomeMatch as any,
      userReflection,
      accuracyRating,
    });
  };

  const hasHarvest = !!entry.actualHarvest;

  return (
    <Card className="p-6">
      {/* Seed */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-lg">Seed (Action Taken)</h3>
          <Badge variant="outline">{new Date(entry.seedDate).toLocaleDateString()}</Badge>
        </div>
        <p className="text-foreground">{entry.seedDescription}</p>
      </div>

      {/* AI Prediction */}
      <div className="mb-6 bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold">AI Predicted Harvest</h3>
          <Badge variant="secondary">{entry.predictionConfidence}% confidence</Badge>
        </div>
        <p className="text-foreground whitespace-pre-wrap">{entry.predictedHarvest}</p>
      </div>

      {/* Actual Harvest */}
      {!hasHarvest && !showHarvestForm && (
        <Button onClick={() => setShowHarvestForm(true)} variant="outline">
          Record Actual Harvest
        </Button>
      )}

      {showHarvestForm && (
        <form onSubmit={handleSubmitHarvest} className="space-y-4 border-t pt-6">
          <h3 className="font-bold text-lg">Record Actual Harvest</h3>
          
          <div>
            <Label htmlFor="actualHarvest">What actually happened?</Label>
            <Textarea
              id="actualHarvest"
              value={actualHarvest}
              onChange={(e) => setActualHarvest(e.target.value)}
              placeholder="Describe the real outcomes..."
              className="min-h-24"
              required
            />
          </div>

          <div>
            <Label htmlFor="outcomeMatch">How did it compare to the prediction?</Label>
            <Select value={outcomeMatch} onValueChange={setOutcomeMatch} required>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome match" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="better">Better than predicted</SelectItem>
                <SelectItem value="as_predicted">As predicted</SelectItem>
                <SelectItem value="worse">Worse than predicted</SelectItem>
                <SelectItem value="mixed">Mixed results</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accuracyRating">AI Accuracy Rating (1-5)</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setAccuracyRating(rating)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    accuracyRating === rating
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="userReflection">Your Reflection (Optional)</Label>
            <Textarea
              id="userReflection"
              value={userReflection}
              onChange={(e) => setUserReflection(e.target.value)}
              placeholder="What did you learn from this?"
              className="min-h-20"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={recordHarvest.isPending}>
              {recordHarvest.isPending ? "Saving..." : "Save Harvest"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowHarvestForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {hasHarvest && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-bold">Actual Harvest</h3>
            {entry.outcomeMatch && (
              <Badge variant={
                entry.outcomeMatch === 'better' ? 'default' :
                entry.outcomeMatch === 'as_predicted' ? 'secondary' :
                'outline'
              }>
                {entry.outcomeMatch.replace('_', ' ')}
              </Badge>
            )}
            {entry.accuracyRating && (
              <Badge variant="outline">
                AI Accuracy: {entry.accuracyRating}/5
              </Badge>
            )}
          </div>
          <p className="text-foreground mb-4">{entry.actualHarvest}</p>
          
          {entry.userReflection && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Your Reflection:</p>
              <p className="text-sm text-muted-foreground">{entry.userReflection}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
