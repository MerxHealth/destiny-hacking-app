import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Target, Sparkles } from "lucide-react";

/**
 * Weekly Review Screen
 * 
 * AI-powered pattern recognition and behavioral change tracking.
 * Users generate weekly summaries and track identity shifts.
 */

export default function WeeklyReview() {
  const [weekStartDate, setWeekStartDate] = useState("");
  const [weekEndDate, setWeekEndDate] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);

  const { data: reviews, isLoading } = trpc.weeklyReviews.list.useQuery({ limit: 10 });
  const utils = trpc.useUtils();

  const generateReview = trpc.weeklyReviews.generate.useMutation({
    onSuccess: () => {
      utils.weeklyReviews.list.invalidate();
      setShowGenerator(false);
      setWeekStartDate("");
      setWeekEndDate("");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekStartDate || !weekEndDate) return;

    generateReview.mutate({
      weekStartDate,
      weekEndDate,
    });
  };

  // Auto-fill current week
  const fillCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setWeekStartDate(monday.toISOString().split('T')[0]);
    setWeekEndDate(sunday.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Weekly Review</h1>
              <p className="text-muted-foreground">
                AI-powered pattern recognition and behavioral insights
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Generate New Review */}
        {!showGenerator ? (
          <Card className="p-8 mb-8 text-center">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generate Weekly Review</h2>
            <p className="text-muted-foreground mb-6">
              AI analyzes your emotional patterns, daily cycles, and behavioral changes
            </p>
            <Button onClick={() => { setShowGenerator(true); fillCurrentWeek(); }} size="lg">
              Generate This Week's Review
            </Button>
          </Card>
        ) : (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">New Weekly Review</h2>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekStartDate">Week Start (Monday)</Label>
                  <Input
                    id="weekStartDate"
                    type="date"
                    value={weekStartDate}
                    onChange={(e) => setWeekStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weekEndDate">Week End (Sunday)</Label>
                  <Input
                    id="weekEndDate"
                    type="date"
                    value={weekEndDate}
                    onChange={(e) => setWeekEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  The AI will analyze your slider calibrations, daily cycle completions, 
                  and insights from this time period to identify patterns and suggest adjustments.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={generateReview.isPending}>
                  {generateReview.isPending ? "Generating..." : "Generate Review"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowGenerator(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Past Reviews</h2>
          
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          )}

          {reviews?.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {!isLoading && reviews?.length === 0 && !showGenerator && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Generate your first weekly review to track patterns.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: any;
}

function ReviewCard({ review }: ReviewCardProps) {
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [identityShiftOld, setIdentityShiftOld] = useState(review.identityShiftOld || "");
  const [identityShiftNew, setIdentityShiftNew] = useState(review.identityShiftNew || "");

  const utils = trpc.useUtils();
  const updateIdentity = trpc.weeklyReviews.updateIdentityShift.useMutation({
    onSuccess: () => {
      utils.weeklyReviews.list.invalidate();
      setShowIdentityForm(false);
    },
  });

  const handleSubmitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateIdentity.mutate({
      reviewId: review.id,
      identityShiftOld,
      identityShiftNew,
    });
  };

  const weekStart = new Date(review.weekStartDate).toLocaleDateString();
  const weekEnd = new Date(review.weekEndDate).toLocaleDateString();

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-lg">Week of {weekStart}</h3>
            <p className="text-sm text-muted-foreground">{weekStart} - {weekEnd}</p>
          </div>
        </div>
        <Badge variant="secondary">
          {review.completionRate}% Complete
        </Badge>
      </div>

      {/* Pattern Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-bold">Pattern Summary</h4>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-foreground whitespace-pre-wrap">{review.patternSummary}</p>
        </div>
      </div>

      {/* Behavioral Metrics */}
      {review.behavioralMetrics && (
        <div className="mb-6">
          <h4 className="font-bold mb-3">Behavioral Metrics</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(review.behavioralMetrics as Record<string, any>).map(([key, value]) => (
              <div key={key} className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm font-semibold text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-bold">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjustment Recommendations */}
      {review.adjustmentRecommendations && (
        <div className="mb-6">
          <h4 className="font-bold mb-3">Recommendations</h4>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-foreground whitespace-pre-wrap">{review.adjustmentRecommendations}</p>
          </div>
        </div>
      )}

      {/* Identity Shift */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-primary" />
          <h4 className="font-bold">Identity Shift</h4>
        </div>

        {!review.identityShiftOld && !showIdentityForm && (
          <Button onClick={() => setShowIdentityForm(true)} variant="outline" size="sm">
            Record Identity Shift
          </Button>
        )}

        {showIdentityForm && (
          <form onSubmit={handleSubmitIdentity} className="space-y-4">
            <div>
              <Label htmlFor="identityShiftOld">Old Identity (Who I was)</Label>
              <Input
                id="identityShiftOld"
                value={identityShiftOld}
                onChange={(e) => setIdentityShiftOld(e.target.value)}
                placeholder="e.g., Reactive victim"
                required
              />
            </div>
            <div>
              <Label htmlFor="identityShiftNew">New Identity (Who I'm becoming)</Label>
              <Input
                id="identityShiftNew"
                value={identityShiftNew}
                onChange={(e) => setIdentityShiftNew(e.target.value)}
                placeholder="e.g., Intentional creator"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" size="sm" disabled={updateIdentity.isPending}>
                {updateIdentity.isPending ? "Saving..." : "Save Identity Shift"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowIdentityForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {review.identityShiftOld && (
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <p className="font-semibold">{review.identityShiftOld}</p>
            </div>
            <div className="text-2xl text-primary">→</div>
            <div className="flex-1 bg-primary/10 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <p className="font-semibold">{review.identityShiftNew}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
