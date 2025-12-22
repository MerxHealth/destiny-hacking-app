import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Sun, Clock, Moon, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DailyCycle() {
  const { user, isLoading: authLoading } = useAuth();
  const [phase, setPhase] = useState<"morning" | "midday" | "evening" | "complete">("morning");

  // Fetch today's cycle
  const { data: todayCycle, isLoading: cycleLoading, refetch: refetchCycle } = trpc.dailyCycle.getToday.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch axes for morning calibration
  const { data: axes } = trpc.sliders.listAxes.useQuery(undefined, {
    enabled: !!user,
  });

  // Determine current phase based on cycle data
  useEffect(() => {
    if (todayCycle) {
      if (todayCycle.isComplete) {
        setPhase("complete");
      } else if (todayCycle.eveningCompletedAt) {
        setPhase("complete");
      } else if (todayCycle.middayCompletedAt) {
        setPhase("evening");
      } else if (todayCycle.morningCompletedAt) {
        setPhase("midday");
      } else {
        setPhase("morning");
      }
    }
  }, [todayCycle]);

  // Morning state
  const [morningCalibrations, setMorningCalibrations] = useState<Record<number, number>>({});

  // Midday state
  const [intendedAction, setIntendedAction] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // Evening state
  const [actionTaken, setActionTaken] = useState("");
  const [observedEffect, setObservedEffect] = useState("");
  const [reflection, setReflection] = useState("");

  // Mutations
  const utils = trpc.useUtils();
  const startMorningMutation = trpc.dailyCycle.startMorning.useMutation({
    onSuccess: () => {
      refetchCycle();
      toast.success("Morning calibration complete");
      setPhase("midday");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const completeMiddayMutation = trpc.dailyCycle.completeMidday.useMutation({
    onSuccess: () => {
      refetchCycle();
      toast.success("Midday action committed");
      setPhase("evening");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const completeEveningMutation = trpc.dailyCycle.completeEvening.useMutation({
    onSuccess: () => {
      refetchCycle();
      toast.success("Daily cycle complete!");
      setPhase("complete");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // AI prompt generation
  const { data: promptData, refetch: generatePrompt, isLoading: promptLoading } = trpc.aiCoach.generatePrompt.useQuery(undefined, {
    enabled: false, // Manual trigger
  });

  useEffect(() => {
    if (promptData?.prompt) {
      setAiPrompt(promptData.prompt);
    }
  }, [promptData]);

  const handleMorningComplete = () => {
    if (!axes || axes.length === 0) {
      toast.error("Create at least one emotional axis first");
      return;
    }

    const calibrations = axes.map(axis => ({
      axisId: axis.id,
      value: morningCalibrations[axis.id] ?? 50,
    }));

    startMorningMutation.mutate({ axisCalibrations: calibrations });
  };

  const handleMiddayComplete = () => {
    if (!intendedAction.trim()) {
      toast.error("Enter your intended action");
      return;
    }

    completeMiddayMutation.mutate({
      decisivePrompt: aiPrompt || undefined,
      intendedAction: intendedAction.trim(),
    });
  };

  const handleEveningComplete = () => {
    if (!actionTaken.trim() || !observedEffect.trim()) {
      toast.error("Complete all required fields");
      return;
    }

    completeEveningMutation.mutate({
      actionTaken: actionTaken.trim(),
      observedEffect: observedEffect.trim(),
      reflection: reflection.trim() || undefined,
    });
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
            <CardDescription>Sign in to access your daily cycle</CardDescription>
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
                <h1 className="text-2xl font-bold">Daily Will Cycle</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Phase Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${phase === "morning" ? "text-primary" : "text-muted-foreground"}`}>
              <Sun className="h-5 w-5" />
              <span className="text-sm font-medium">Morning</span>
            </div>
            <div className="h-px w-12 bg-border" />
            <div className={`flex items-center gap-2 ${phase === "midday" ? "text-primary" : "text-muted-foreground"}`}>
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Midday</span>
            </div>
            <div className="h-px w-12 bg-border" />
            <div className={`flex items-center gap-2 ${phase === "evening" ? "text-primary" : "text-muted-foreground"}`}>
              <Moon className="h-5 w-5" />
              <span className="text-sm font-medium">Evening</span>
            </div>
          </div>

          {/* Morning Phase */}
          {phase === "morning" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sun className="h-6 w-6 text-primary" />
                  <CardTitle>Morning Calibration</CardTitle>
                </div>
                <CardDescription>
                  Calibrate your current emotional state. This is measurement, not journaling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!axes || axes.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">No emotional axes found.</p>
                    <Button asChild>
                      <Link href="/sliders">Create Your First Axis</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {axes.map((axis) => {
                      const value = morningCalibrations[axis.id] ?? 50;
                      return (
                        <div key={axis.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">
                              {axis.leftLabel} ← → {axis.rightLabel}
                            </div>
                            <div className="text-lg font-bold text-primary">{value}</div>
                          </div>
                          <Slider
                            value={[value]}
                            onValueChange={(v) => {
                              setMorningCalibrations({ ...morningCalibrations, [axis.id]: v[0] });
                            }}
                            max={100}
                            step={1}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{axis.leftLabel}</span>
                            <span>{axis.rightLabel}</span>
                          </div>
                        </div>
                      );
                    })}
                    <Button 
                      onClick={handleMorningComplete} 
                      disabled={startMorningMutation.isPending}
                      className="w-full"
                    >
                      {startMorningMutation.isPending ? "Recording..." : "Complete Morning Calibration"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Midday Phase */}
          {phase === "midday" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <CardTitle>Midday: Decisive Action</CardTitle>
                </div>
                <CardDescription>
                  Commit to ONE action today. Not a goal. Not a wish. A decision.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">AI-Generated Prompt (Optional)</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePrompt()}
                      disabled={promptLoading}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {promptLoading ? "Generating..." : "Generate Prompt"}
                    </Button>
                  </div>
                  {aiPrompt && (
                    <div className="p-4 bg-muted rounded-lg text-sm">
                      {aiPrompt}
                    </div>
                  )}
                </div>

                {/* Intended Action */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Intended Action</label>
                  <Textarea
                    placeholder="What specific action will you take today? Be concrete."
                    value={intendedAction}
                    onChange={(e) => setIntendedAction(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: "Speak up in the 3pm meeting about the timeline concern" not "Be more confident"
                  </p>
                </div>

                <Button
                  onClick={handleMiddayComplete}
                  disabled={completeMiddayMutation.isPending}
                  className="w-full"
                >
                  {completeMiddayMutation.isPending ? "Committing..." : "Commit to Action"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Evening Phase */}
          {phase === "evening" && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Moon className="h-6 w-6 text-primary" />
                  <CardTitle>Evening: Cause-Effect Mapping</CardTitle>
                </div>
                <CardDescription>
                  Map what happened. This is evidence, not therapy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reminder of intended action */}
                {todayCycle?.intendedAction && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">You committed to:</div>
                    <div className="text-sm font-medium">{todayCycle.intendedAction}</div>
                  </div>
                )}

                {/* Action Taken */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">What Actually Happened</label>
                  <Textarea
                    placeholder="Did you do it? What changed?"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Observed Effect */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observed Effect</label>
                  <Textarea
                    placeholder="What was the result? What changed externally?"
                    value={observedEffect}
                    onChange={(e) => setObservedEffect(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Reflection (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reflection (Optional)</label>
                  <Textarea
                    placeholder="What did you learn about the cause-effect relationship?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleEveningComplete}
                  disabled={completeEveningMutation.isPending}
                  className="w-full"
                >
                  {completeEveningMutation.isPending ? "Completing..." : "Complete Daily Cycle"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Complete Phase */}
          {phase === "complete" && (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <CardTitle>Daily Cycle Complete</CardTitle>
                <CardDescription>
                  You've completed today's practice. This is evidence of conscious will.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayCycle && (
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Intended Action:</div>
                      <div>{todayCycle.intendedAction}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">What Happened:</div>
                      <div>{todayCycle.actionTaken}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Observed Effect:</div>
                      <div>{todayCycle.observedEffect}</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href="/insights">View Insights</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
