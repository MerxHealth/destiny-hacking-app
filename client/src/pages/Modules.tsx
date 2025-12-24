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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Path</h1>
              <p className="text-muted-foreground">
                14 modules to master your free will
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Module List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedModuleId === module.id ? 'ring-2 ring-primary' : ''
                } ${isLocked ? 'opacity-60' : ''}`}
                onClick={() => !isLocked && setSelectedModuleId(module.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {module.moduleNumber}
                    </span>
                    {statusIcon}
                  </div>
                  <Badge variant="outline">{module.estimatedMinutes} min</Badge>
                </div>

                <h3 className="font-bold text-lg mb-2">{module.title}</h3>
                
                {progress && progress.progressPercentage > 0 && (
                  <div className="mb-3">
                    <Progress value={progress.progressPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress.progressPercentage}% complete
                    </p>
                  </div>
                )}

                {progress && progress.practiceDaysCompleted > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{progress.practiceDaysCompleted} practice days</span>
                  </div>
                )}

                {isLocked && module.requiredPreviousModule && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Complete Module {module.requiredPreviousModule} first
                  </p>
                )}
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
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-muted-foreground">
              Module {module.moduleNumber}
            </span>
            {isCompleted && <Badge className="bg-green-500">Completed</Badge>}
          </div>
          <h2 className="text-3xl font-bold mb-2">{module.title}</h2>
          <p className="text-muted-foreground">
            {module.estimatedMinutes} minutes • {module.requiredPracticeDays} practice days required
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>✕</Button>
      </div>

      {isLocked ? (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Module Locked</p>
          <p className="text-muted-foreground mb-6">
            Complete the previous module and practice for {module.requiredPracticeDays} days to unlock.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Core Principle */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Core Principle</h3>
            </div>
            <p className="text-foreground leading-relaxed">{module.corePrinciple}</p>
          </section>

          {/* Mental Model */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Mental Model</h3>
            </div>
            <p className="text-foreground leading-relaxed">{module.mentalModel}</p>
          </section>

          {/* Daily Practice */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Daily Practice</h3>
            </div>
            <p className="text-foreground leading-relaxed mb-4">{module.dailyPractice}</p>
            
            {progress && !isCompleted && (
              <div className="flex items-center gap-4">
                <Button onClick={handleRecordPractice} disabled={recordPractice.isPending}>
                  {recordPractice.isPending ? "Recording..." : "Mark Today's Practice Complete"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {progress.practiceDaysCompleted} / {module.requiredPracticeDays} days
                </span>
              </div>
            )}
          </section>

          {/* Decision Challenge */}
          <section>
            <h3 className="font-bold text-lg mb-3">Decision Challenge</h3>
            <p className="text-foreground leading-relaxed mb-4">{module.decisionChallenge}</p>
            
            {progress && !progress.challengeCompleted && !isCompleted && (
              <Button onClick={handleCompleteChallenge} disabled={completeChallenge.isPending}>
                {completeChallenge.isPending ? "Completing..." : "Mark Challenge Complete"}
              </Button>
            )}
            {progress?.challengeCompleted && (
              <Badge className="bg-green-500">Challenge Completed</Badge>
            )}
          </section>

          {/* Reflection */}
          <section>
            <h3 className="font-bold text-lg mb-3">Reflection</h3>
            <p className="text-muted-foreground mb-4">{module.reflectionPrompt}</p>
            
            {!isCompleted && (
              <>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Write your reflection here..."
                  className="min-h-32 mb-4"
                />
                <Button 
                  onClick={handleSaveReflection} 
                  disabled={!reflection.trim() || saveReflection.isPending}
                >
                  {saveReflection.isPending ? "Saving..." : "Save Reflection"}
                </Button>
              </>
            )}
            {progress?.reflectionEntry && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{progress.reflectionEntry}</p>
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
    </Card>
  );
}
