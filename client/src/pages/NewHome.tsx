import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Target, Sun, Sunset, Moon } from "lucide-react";
import { Onboarding } from "@/components/Onboarding";

/**
 * Home Screen (Command Center)
 * 
 * Purpose: Calm, focused, actionable starting point for the user's day
 * 
 * Design:
 * - Header: "Command Center" or current date
 * - Primary: Horizontal swipeable carousel of 3-5 large Emotional Sliders
 * - Secondary: "Today's Intention" (single sentence)
 * - Action Buttons: Morning Calibration, Midday Check-In, Evening Reflection
 * - Progress Indicator: Subtle ring showing daily practice completion
 */

export default function NewHome() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: axes } = trpc.sliders.listAxes.useQuery();
  const { data: latestStates } = trpc.sliders.getLatestStates.useQuery();
  const { data: todayCycle } = trpc.dailyCycle.getToday.useQuery();
  
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
  const [sliderValues, setSliderValues] = useState<Record<number, number>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Initialize slider values from latest states
  useEffect(() => {
    if (latestStates) {
      const values: Record<number, number> = {};
      latestStates.forEach(state => {
        values[state.axisId] = state.value;
      });
      setSliderValues(values);
    }
  }, [latestStates]);

  const visibleAxes = axes?.slice(0, 5) || [];
  const currentAxis = visibleAxes[currentSliderIndex];

  // Calculate daily practice completion
  const practiceCompletion = todayCycle 
    ? (todayCycle.morningCompletedAt ? 33 : 0) + 
      (todayCycle.middayCompletedAt ? 33 : 0) + 
      (todayCycle.eveningCompletedAt ? 34 : 0)
    : 0;

  const handleSliderChange = (value: number[]) => {
    if (currentAxis) {
      setSliderValues(prev => ({ ...prev, [currentAxis.id]: value[0] }));
    }
  };

  const handlePrevSlider = () => {
    setCurrentSliderIndex(prev => (prev > 0 ? prev - 1 : visibleAxes.length - 1));
  };

  const handleNextSlider = () => {
    setCurrentSliderIndex(prev => (prev < visibleAxes.length - 1 ? prev + 1 : 0));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Destiny Hacking</h1>
          <p className="text-muted-foreground mb-6">
            Train your free will. Build your destiny.
          </p>
          <Button asChild className="w-full">
            <a href={`${import.meta.env.VITE_OAUTH_PORTAL_URL}?appId=${import.meta.env.VITE_APP_ID}`}>
              Sign In
            </a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onSkip={handleOnboardingSkip} 
        />
      )}
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Command Center</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-2xl">
        {/* Progress Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - practiceCompletion / 100)}`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{practiceCompletion}%</span>
            </div>
          </div>
        </div>

        {/* Emotional Sliders Carousel */}
        <div className="mb-12">
          {currentAxis && (
            <div className="space-y-8">
              {/* Slider Label */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">
                  {currentAxis.leftLabel} ↔ {currentAxis.rightLabel}
                </h2>
                {currentAxis.description && (
                  <p className="text-sm text-muted-foreground">{currentAxis.description}</p>
                )}
              </div>

              {/* Large Slider */}
              <div className="relative py-12">
                <button
                  onClick={handlePrevSlider}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Previous slider"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="px-16">
                  <Slider
                    value={[sliderValues[currentAxis.id] || 50]}
                    onValueChange={handleSliderChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-sm text-muted-foreground">{currentAxis.leftLabel}</span>
                    <span className="text-4xl font-bold">
                      {sliderValues[currentAxis.id] || 50}
                    </span>
                    <span className="text-sm text-muted-foreground">{currentAxis.rightLabel}</span>
                  </div>
                </div>

                <button
                  onClick={handleNextSlider}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Next slider"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Slider Dots */}
              <div className="flex justify-center gap-2">
                {visibleAxes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSliderIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSliderIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-muted hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to slider ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {!currentAxis && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No emotional axes configured yet.</p>
              <Button asChild>
                <Link href="/sliders">Create Your First Slider</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Today's Intention */}
        <Card className="p-6 mb-8 bg-card/50">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Today's Intention</h3>
              <p className="text-muted-foreground">
                {todayCycle?.intendedAction || "Set your intention during Morning Calibration"}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            asChild
            size="lg"
            variant={todayCycle?.morningCompletedAt ? "outline" : "default"}
            className="h-auto py-6 flex flex-col gap-2"
          >
            <Link href="/daily-cycle?phase=morning">
              <Sun className="w-6 h-6" />
              <span className="font-semibold">Morning Calibration</span>
              <span className="text-xs opacity-70">5 mins</span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant={todayCycle?.middayCompletedAt ? "outline" : "default"}
            className="h-auto py-6 flex flex-col gap-2"
            disabled={!todayCycle?.morningCompletedAt}
          >
            <Link href="/daily-cycle?phase=midday">
              <Sunset className="w-6 h-6" />
              <span className="font-semibold">Midday Check-In</span>
              <span className="text-xs opacity-70">2 mins</span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant={todayCycle?.eveningCompletedAt ? "outline" : "default"}
            className="h-auto py-6 flex flex-col gap-2"
            disabled={!todayCycle?.middayCompletedAt}
          >
            <Link href="/daily-cycle?phase=evening">
              <Moon className="w-6 h-6" />
              <span className="font-semibold">Evening Reflection</span>
              <span className="text-xs opacity-70">5 mins</span>
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/modules">📚 Learning Path</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/weekly-review">📊 Weekly Review</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/prayer-journal">🙏 Prayer Journal</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/bias-clearing">🧠 Bias Clearing</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/sowing-reaping">🌱 Sowing & Reaping</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/inner-circle">👥 Inner Circle</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/insights">💡 Insights</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">⚙️ Settings</Link>
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
