import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gauge, Calendar, BookOpen, ArrowRight, ArrowLeft, X } from "lucide-react";

/**
 * Onboarding Flow Component
 * 
 * 3-step tutorial for new users explaining:
 * 1. Emotional Sliders - Calibrate your state
 * 2. Daily Cycles - Morning → Midday → Evening practice
 * 3. Learning Path - 14 interactive modules
 */

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Gauge,
      title: "Emotional Sliders",
      description: "Calibrate your emotional state with precision",
      content: (
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            Instead of vague feelings, use <strong>bipolar axes</strong> to measure exactly where you are:
          </p>
          <div className="bg-primary/10 p-6 rounded-lg border-l-4 border-primary">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold">Anxiety ↔ Calm</p>
              <p className="text-sm text-muted-foreground">Measures courage in work situations</p>
            </div>
            <div className="relative h-2 bg-muted rounded-full">
              <div className="absolute h-full bg-primary rounded-full" style={{ width: '65%' }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white border-2 border-primary rounded-full shadow-lg" style={{ left: '65%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Anxiety</span>
              <span className="font-bold text-primary">65</span>
              <span>Calm</span>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Create custom axes for different life areas (Work, Relationships, Health)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Track changes over time with visual charts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Save profiles for quick context switching</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      icon: Calendar,
      title: "Daily Will Cycle",
      description: "Operationalize free will with structured practice",
      content: (
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            Transform emotional awareness into concrete action through a <strong>three-phase daily practice</strong>:
          </p>
          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">1</div>
                <h4 className="font-semibold">Morning Calibration</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Measure your emotional state across all axes. Set your intention for the day.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">2</div>
                <h4 className="font-semibold">Midday Decisive Action</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                AI generates a specific, actionable prompt based on your morning state. Commit to one concrete decision.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">3</div>
                <h4 className="font-semibold">Evening Reflection</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Map cause-effect: What did you do? What happened? AI analyzes patterns and generates insights.
              </p>
            </div>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm font-medium">
              Complete cycles build a <strong>streak</strong> and unlock deeper AI insights
            </p>
          </div>
        </div>
      )
    },
    {
      icon: BookOpen,
      title: "Learning Path",
      description: "14 modules to master your free will",
      content: (
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            Progress through <strong>gamified learning modules</strong> that teach the philosophy and practice of Destiny Hacking:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Module 1</div>
              <div className="font-medium text-sm">The Emotional Compass</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Module 2</div>
              <div className="font-medium text-sm">Bipolar Thinking</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Module 3</div>
              <div className="font-medium text-sm">Calibration as Ritual</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Module 4</div>
              <div className="font-medium text-sm">The Decisive Moment</div>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Each module includes core principles, mental models, and daily practices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Complete practice days and decision challenges to unlock the next module</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Reflect on your learning and track progress through all 14 modules</span>
            </li>
          </ul>
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm font-medium">
              Modules unlock sequentially as you demonstrate mastery
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onSkip}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button variant="link" onClick={onSkip} className="text-muted-foreground">
              Skip Tutorial
            </Button>

            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
