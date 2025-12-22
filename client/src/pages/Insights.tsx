import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, TrendingUp, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";

export default function Insights() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedInsightId, setSelectedInsightId] = useState<number | null>(null);

  // Fetch insights
  const { data: insights, isLoading: insightsLoading } = trpc.insights.list.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  // Mutations
  const utils = trpc.useUtils();
  const markReadMutation = trpc.insights.markRead.useMutation({
    onSuccess: () => {
      utils.insights.list.invalidate();
    },
  });

  const rateMutation = trpc.insights.rate.useMutation({
    onSuccess: () => {
      utils.insights.list.invalidate();
      toast.success("Rating saved");
    },
  });

  const handleMarkRead = (insightId: number) => {
    markReadMutation.mutate({ insightId });
  };

  const handleRate = (insightId: number, rating: number) => {
    rateMutation.mutate({ insightId, rating });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>Sign in to access your insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" asChild>
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">AI Insights</h1>
                <p className="text-sm text-muted-foreground">
                  Pattern analysis and strategic observations
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {insightsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        ) : !insights || insights.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>No Insights Yet</CardTitle>
              <CardDescription>
                Complete daily cycles and calibrate your emotional state to generate AI insights
                about your patterns and cause-effect relationships.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <Button asChild>
                <Link href="/daily-cycle">Start Daily Cycle</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sliders">Calibrate Emotions</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> These are strategic observations, not therapy. They map
              cause-effect relationships in your emotional patterns.
            </div>

            {insights.map((insight) => (
              <Card
                key={insight.id}
                className={`transition-all ${
                  !insight.isRead ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        {!insight.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {insight.insightType === "cause_effect" && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Cause-Effect
                          </Badge>
                        )}
                        {insight.insightType === "pattern" && (
                          <Badge variant="outline" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            Pattern
                          </Badge>
                        )}

                        <span>
                          {new Date(insight.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {insight.content}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Rate this insight:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRate(insight.id, rating)}
                            className={`p-1 hover:scale-110 transition-transform ${
                              insight.userRating && insight.userRating >= rating
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                            disabled={rateMutation.isPending}
                          >
                            <Star
                              className="h-4 w-4"
                              fill={
                                insight.userRating && insight.userRating >= rating
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {!insight.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkRead(insight.id)}
                        disabled={markReadMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
