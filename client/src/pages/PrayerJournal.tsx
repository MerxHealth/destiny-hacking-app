import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Lightbulb, Zap, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

/**
 * Prayer Journal
 * 
 * Four-Part Prayer Protocol:
 * 1. Gratitude - What am I grateful for?
 * 2. Clarity - What do I need to see clearly?
 * 3. Strength - What do I need courage/power for?
 * 4. Alignment - How can I align with truth/purpose?
 */

export default function PrayerJournal() {
  const [gratitude, setGratitude] = useState("");
  const [clarity, setClarity] = useState("");
  const [strength, setStrength] = useState("");
  const [alignment, setAlignment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: todaysPrayer } = trpc.prayer.getToday.useQuery();
  const { data: entries, isLoading } = trpc.prayer.list.useQuery({ limit: 20 });
  const utils = trpc.useUtils();

  const deleteMutation = trpc.prayer.delete.useMutation({
    onSuccess: () => {
      utils.prayer.list.invalidate();
      utils.prayer.getToday.invalidate();
      toast.success("Prayer entry deleted");
    },
  });

  const createEntry = trpc.prayer.create.useMutation({
    onSuccess: () => {
      utils.prayer.list.invalidate();
      utils.prayer.getToday.invalidate();
      setGratitude("");
      setClarity("");
      setStrength("");
      setAlignment("");
      setShowForm(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createEntry.mutate({
      prayerDate: new Date().toISOString().split('T')[0],
      gratitude: gratitude || undefined,
      clarity: clarity || undefined,
      strength: strength || undefined,
      alignment: alignment || undefined,
    });
  };

  const hasTodaysPrayer = !!todaysPrayer;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Prayer Journal" subtitle="Four-part prayer protocol" showBack />

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Today's Prayer */}
        {hasTodaysPrayer && !showForm && (
          <Card className="p-8 mb-8 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Today's Prayer</h2>
              <Badge variant="default">Complete</Badge>
            </div>
            <PrayerContent prayer={todaysPrayer} />
          </Card>
        )}

        {/* Create New Entry */}
        {!hasTodaysPrayer && !showForm && (
          <Card className="p-8 mb-8 text-center">
            <Heart className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Today's Prayer</h2>
            <p className="text-muted-foreground mb-6">
              Take a moment to connect with gratitude, clarity, strength, and alignment
            </p>
            <Button onClick={() => setShowForm(true)} size="lg">
              Begin Prayer Protocol
            </Button>
          </Card>
        )}

        {showForm && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Four-Part Prayer Protocol</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Gratitude */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <Label htmlFor="gratitude" className="text-lg font-bold">
                    1. Gratitude
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  What am I grateful for today? What blessings do I acknowledge?
                </p>
                <Textarea
                  id="gratitude"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="I'm grateful for..."
                  className="min-h-24"
                />
              </div>

              {/* 2. Clarity */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <Label htmlFor="clarity" className="text-lg font-bold">
                    2. Clarity
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  What do I need to see clearly? Where am I confused or uncertain?
                </p>
                <Textarea
                  id="clarity"
                  value={clarity}
                  onChange={(e) => setClarity(e.target.value)}
                  placeholder="Help me see..."
                  className="min-h-24"
                />
              </div>

              {/* 3. Strength */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <Label htmlFor="strength" className="text-lg font-bold">
                    3. Strength
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  What do I need courage or power for? Where do I need to act?
                </p>
                <Textarea
                  id="strength"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="Give me strength to..."
                  className="min-h-24"
                />
              </div>

              {/* 4. Alignment */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <Label htmlFor="alignment" className="text-lg font-bold">
                    4. Alignment
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  How can I align my will with truth and purpose? What is the right path?
                </p>
                <Textarea
                  id="alignment"
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value)}
                  placeholder="Align me with..."
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createEntry.isPending}>
                  {createEntry.isPending ? "Saving..." : "Save Prayer"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Prayer History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Prayer History</h2>
          
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading prayers...</p>
            </div>
          )}

          {entries?.map((entry) => {
            const isToday = entry.prayerDate === new Date().toISOString().split('T')[0];
            if (isToday && hasTodaysPrayer) return null; // Already shown above
            
            return (
              <Card key={entry.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">
                    {new Date(entry.prayerDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <button
                    onClick={() => {
                      if (confirm("Delete this prayer entry?")) {
                        deleteMutation.mutate({ id: entry.id });
                      }
                    }}
                    className="text-muted-foreground/40 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <PrayerContent prayer={entry} />
              </Card>
            );
          })}

          {!isLoading && entries?.length === 0 && !showForm && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No prayers yet. Begin your first prayer to start your journal.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface PrayerContentProps {
  prayer: any;
}

function PrayerContent({ prayer }: PrayerContentProps) {
  return (
    <div className="space-y-6">
      {prayer.gratitude && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-500" />
            <h4 className="font-semibold">Gratitude</h4>
          </div>
          <p className="text-muted-foreground pl-6">{prayer.gratitude}</p>
        </div>
      )}

      {prayer.clarity && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h4 className="font-semibold">Clarity</h4>
          </div>
          <p className="text-muted-foreground pl-6">{prayer.clarity}</p>
        </div>
      )}

      {prayer.strength && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <h4 className="font-semibold">Strength</h4>
          </div>
          <p className="text-muted-foreground pl-6">{prayer.strength}</p>
        </div>
      )}

      {prayer.alignment && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Alignment</h4>
          </div>
          <p className="text-muted-foreground pl-6">{prayer.alignment}</p>
        </div>
      )}
    </div>
  );
}
