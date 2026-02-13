import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Lock, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Target, 
  Calendar,
  ArrowRight 
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

/**
 * Book Modules Page
 * 
 * Displays the 14 interactive learning modules in a gamified structure.
 * Each module unlocks after completing the previous one + required practice days.
 */

export default function Modules() {
  const { data: modulesWithProgress, isLoading } = trpc.modules.list.useQuery();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const selectedModule = modulesWithProgress?.find(m => m.id === selectedModuleId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Practice" subtitle="14 modules to master" showBack />
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Practice" subtitle="14 modules to master your free will" showBack />

      <div className="px-4 py-4">
        {/* Module List */}
        <div className="space-y-2 mb-6">
          {modulesWithProgress?.map((item) => {
          const module = item;
          const progress = item.progress;
            const isLocked = progress?.status === "locked" || !progress;
            const isUnlocked = progress?.status === "unlocked";
            const isInProgress = progress?.status === "in_progress";
            const isCompleted = progress?.status === "completed";
            
            const statusIcon = isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Circle className="w-5 h-5 text-primary" />
            );

            return (
              <Card
                key={module.id}
                className={`cursor-pointer transition-all active:scale-[0.98] ${
                  selectedModuleId === module.id ? 'ring-1 ring-primary bg-primary/5' : 'border-border/50'
                } ${isLocked ? 'opacity-50' : ''}`}
                onClick={() => !isLocked && setSelectedModuleId(module.id)}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-500/15' : isLocked ? 'bg-muted' : 'bg-primary/15'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <span className="text-sm font-bold">{module.moduleNumber}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{module.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{module.estimatedMinutes} min</span>
                      {progress && progress.progressPercentage > 0 && (
                        <span className="text-[10px] text-primary">{progress.progressPercentage}%</span>
                      )}
                      {progress && progress.practiceDaysCompleted > 0 && (
                        <span className="text-[10px] text-muted-foreground">{progress.practiceDaysCompleted}d practiced</span>
                      )}
                    </div>
                    {progress && progress.progressPercentage > 0 && (
                      <Progress value={progress.progressPercentage} className="h-1 mt-1.5" />
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Module Detail Panel */}
        {selectedModule && (
          <ModuleDetail
            module={selectedModule}
            progress={selectedModule.progress}
            onClose={() => setSelectedModuleId(null)}
          />
        )}
      </div>
    </div>
  );
}

interface DecisionOption {
  choice: string;
  impact: Record<string, number>;
  outcome: string;
}

interface DecisionChallenge {
  scenario: string;
  options: DecisionOption[];
}

function DecisionChallengeView({
  challenge,
  isCompleted,
  onComplete,
  isPending,
}: {
  challenge: any;
  isCompleted: boolean;
  onComplete: () => void;
  isPending: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  // Parse the challenge data
  const data: DecisionChallenge | null = typeof challenge === 'string'
    ? (() => { try { return JSON.parse(challenge); } catch { return null; } })()
    : challenge;

  if (!data || !data.scenario) {
    return <p className="text-sm text-muted-foreground">No challenge available.</p>;
  }

  const handleSelect = (index: number) => {
    if (isCompleted || showOutcome) return;
    setSelectedOption(index);
    setShowOutcome(true);
  };

  return (
    <div className="space-y-3">
      {/* Scenario */}
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-sm font-medium text-foreground">{data.scenario}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {data.options.map((option, i) => {
          const isSelected = selectedOption === i;
          const impactSum = Object.values(option.impact).reduce((a, b) => a + b, 0);
          const isPositive = impactSum > 0;
          const isNeutral = impactSum === 0;

          return (
            <div key={i}>
              <button
                onClick={() => handleSelect(i)}
                disabled={isCompleted || showOutcome}
                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                  isSelected
                    ? isPositive
                      ? 'border-green-500 bg-green-500/10'
                      : isNeutral
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-red-500 bg-red-500/10'
                    : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                } ${isCompleted ? 'opacity-60 cursor-default' : ''}`}
              >
                <span className="font-medium">{option.choice}</span>
              </button>
              {isSelected && showOutcome && (
                <div className={`mt-1 ml-2 p-2 rounded text-xs ${
                  isPositive ? 'text-green-600 dark:text-green-400' : isNeutral ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {option.outcome}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete button */}
      {showOutcome && !isCompleted && (
        <Button size="sm" onClick={onComplete} disabled={isPending}>
          {isPending ? "Completing..." : "Mark Challenge Complete"}
        </Button>
      )}
      {isCompleted && (
        <Badge className="bg-green-500 text-xs">Challenge Completed</Badge>
      )}
    </div>
  );
}

interface ModuleDetailProps {
  module: any;
  progress: any;
  onClose: () => void;
}

function ModuleDetail({ module, progress, onClose }: ModuleDetailProps) {
  const utils = trpc.useUtils();
  const [reflection, setReflection] = useState(progress?.reflectionEntry || "");

  const startModule = trpc.modules.start.useMutation({
    onSuccess: () => {
      utils.modules.list.invalidate();
    },
  });

  const recordPractice = trpc.modules.recordPractice.useMutation({
    onSuccess: () => {
      utils.modules.list.invalidate();
    },
  });

  const completeChallenge = trpc.modules.completeChallenge.useMutation({
    onSuccess: () => {
      utils.modules.list.invalidate();
    },
  });

  const saveReflection = trpc.modules.saveReflection.useMutation({
    onSuccess: () => {
      utils.modules.list.invalidate();
    },
  });

  const completeModule = trpc.modules.complete.useMutation({
    onSuccess: () => {
      utils.modules.list.invalidate();
      onClose();
    },
  });

  const handleStart = () => {
    startModule.mutate({ moduleId: module.id });
  };

  const handleRecordPractice = () => {
    recordPractice.mutate({ moduleId: module.id });
  };

  const handleCompleteChallenge = () => {
    completeChallenge.mutate({ moduleId: module.id });
  };

  const handleSaveReflection = () => {
    saveReflection.mutate({ 
      moduleId: module.id, 
      reflection 
    });
  };

  const handleComplete = () => {
    completeModule.mutate({ moduleId: module.id });
  };

  const isLocked = !progress || progress.status === "locked";
  const isCompleted = progress?.status === "completed";

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <PageHeader
        title={`Module ${module.moduleNumber}`}
        subtitle={module.title}
        showBack
        backPath="#"
        rightAction={
          <div className="flex items-center gap-2">
            {isCompleted && <Badge className="bg-green-500 text-xs">Done</Badge>}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <span className="text-lg">✕</span>
            </Button>
          </div>
        }
      />
      <div className="px-4 py-4">

      {isLocked ? (
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-semibold mb-1">Module Locked</p>
          <p className="text-sm text-muted-foreground">
            Complete the previous module and practice for {module.requiredPracticeDays} days to unlock.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Core Principle */}
          <section className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Core Principle</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{module.corePrinciple}</p>
          </section>

          {/* Mental Model */}
          <section className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Mental Model</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{module.mentalModel}</p>
          </section>

          {/* Daily Practice */}
          <section className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm">Daily Practice</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-3">{module.dailyPractice}</p>
            
            {progress && !isCompleted && (
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleRecordPractice} disabled={recordPractice.isPending}>
                  {recordPractice.isPending ? "Recording..." : "Mark Complete"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {progress.practiceDaysCompleted}/{module.requiredPracticeDays} days
                </span>
              </div>
            )}
          </section>

          {/* Decision Challenge */}
          <section className="bg-card rounded-xl p-4 border border-border/50">
            <h3 className="font-bold text-sm mb-2">Decision Challenge</h3>
            <DecisionChallengeView
              challenge={module.decisionChallenge}
              isCompleted={!!progress?.challengeCompleted || isCompleted}
              onComplete={handleCompleteChallenge}
              isPending={completeChallenge.isPending}
            />
          </section>

          {/* Reflection */}
          <section className="bg-card rounded-xl p-4 border border-border/50">
            <h3 className="font-bold text-sm mb-2">Reflection</h3>
            <p className="text-xs text-muted-foreground mb-3">{module.reflectionPrompt}</p>
            
            {!isCompleted && (
              <>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write your reflection here..."
                  className="min-h-24 mb-3 text-sm"
                />
                <Button 
                  size="sm"
                  onClick={handleSaveReflection} 
                  disabled={!reflection.trim() || saveReflection.isPending}
                >
                  {saveReflection.isPending ? "Saving..." : "Save Reflection"}
                </Button>
              </>
            )}
            {progress?.reflectionEntry && (
              <div className="bg-muted p-3 rounded-lg mt-3">
                <p className="text-xs">{progress.reflectionEntry}</p>
              </div>
            )}
          </section>

          {/* Complete Module */}
          {progress && !isCompleted && progress.challengeCompleted && progress.reflectionEntry && (
            <div className="pt-6 border-t">
              <Button 
                onClick={handleComplete} 
                size="lg" 
                className="w-full"
                disabled={completeModule.isPending}
              >
                {completeModule.isPending ? "Completing..." : "Complete Module"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Start Module */}
          {!progress && (
            <div className="pt-6 border-t">
              <Button 
                onClick={handleStart} 
                size="lg" 
                className="w-full"
                disabled={startModule.isPending}
              >
                {startModule.isPending ? "Starting..." : "Start This Module"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
