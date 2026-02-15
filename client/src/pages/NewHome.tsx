import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Onboarding } from "@/components/Onboarding";
import { InitialCalibration } from "@/components/InitialCalibration";
import { FirstImpression } from "@/components/FirstImpression";
import { PullToRefresh } from "@/components/PullToRefresh";
import { DoctrineCard } from "@/components/DoctrineCard";
import { InvictusFooter } from "@/components/InvictusFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { getChapterTitle } from "@shared/chapterTranslations";
import {
  Layers,
  BookOpen,
  Headphones,
  GraduationCap,
  Trophy,
  TrendingUp,
  Zap,
  Brain,
  Calendar,
  BarChart3,
  Sprout,
  Shield,
  Users,
  Star,
  ScrollText,
  Settings,
  Play,
} from "lucide-react";

export default function NewHome() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { language, t } = useLanguage();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: todayCycle } = trpc.dailyCycle.getToday.useQuery();
  const { data: axes } = trpc.sliders.listAxes.useQuery();
  const { data: lastListened } = trpc.audiobook.getLastListened.useQuery();
  const { data: pdfProgress } = trpc.pdf.getProgress.useQuery();
  const { data: destinyScore } = trpc.sliders.getDestinyScore.useQuery();
  const { data: recentCycles } = trpc.dailyCycle.getHistory.useQuery({ days: 30 });
  const { data: lowest3 } = trpc.sliders.getLowest3.useQuery();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      utils.dailyCycle.getToday.invalidate(),
      utils.sliders.listAxes.invalidate(),
      utils.audiobook.getLastListened.invalidate(),
      utils.pdf.getProgress.invalidate(),
      utils.sliders.getDestinyScore.invalidate(),
      utils.dailyCycle.getHistory.invalidate(),
      utils.sliders.getLowest3.invalidate(),
    ]);
  }, [utils]);

  // First-time user flow
  const [showFirstImpression, setShowFirstImpression] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInitialCalibration, setShowInitialCalibration] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenFirstImpression = localStorage.getItem("first_impression_seen");
      const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
      if (!hasSeenFirstImpression) {
        setShowFirstImpression(true);
      } else if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleFirstImpressionComplete = () => {
    localStorage.setItem("first_impression_seen", "true");
    setShowFirstImpression(false);
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowOnboarding(false);
    const hasCalibrated = localStorage.getItem("initial_calibration_completed");
    if (!hasCalibrated && axes && axes.length > 0) {
      setShowInitialCalibration(true);
    }
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowOnboarding(false);
    const hasCalibrated = localStorage.getItem("initial_calibration_completed");
    if (!hasCalibrated && axes && axes.length > 0) {
      setShowInitialCalibration(true);
    }
  };

  const handleCalibrationComplete = () => {
    localStorage.setItem("initial_calibration_completed", "true");
    setShowInitialCalibration(false);
  };

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("Good Morning", "Bom Dia");
    if (hour < 17) return t("Good Afternoon", "Boa Tarde");
    return t("Good Evening", "Boa Noite");
  }, [t]);

  // Streak calculation
  const streak = useMemo(() => {
    if (!recentCycles || recentCycles.length === 0) return 0;
    const sortedCycles = [...recentCycles]
      .filter(c => c.isComplete)
      .sort((a, b) => new Date(b.cycleDate).getTime() - new Date(a.cycleDate).getTime());
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sortedCycles.length; i++) {
      const cycleDate = new Date(sortedCycles[i].cycleDate);
      cycleDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      if (cycleDate.getTime() === expectedDate.getTime()) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [recentCycles]);

  // Lowest axis for reflection prompt
  const lowestAxis = useMemo(() => {
    if (!lowest3 || lowest3.length === 0 || !axes) return null;
    const lowestState = lowest3[0];
    const axis = axes.find((a: any) => a.id === lowestState.axisId);
    if (!axis) return null;
    return { ...axis, value: lowestState.value };
  }, [lowest3, axes]);

  // Continue chips
  const hasLastListened = lastListened && lastListened.currentPosition > 0 && !lastListened.completed;
  const hasBookProgress = pdfProgress && pdfProgress.currentPage > 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 4×4 icon grid
  const navItems = useMemo(() => [
    // Row 1 — Core Practice
    { icon: Layers, label: t("Sliders", "Controles"), path: "/sliders", bg: "bg-blue-500/15", color: "text-blue-400" },
    { icon: BookOpen, label: t("Chapters", "Capítulos"), path: "/book", bg: "bg-emerald-500/15", color: "text-emerald-400" },
    { icon: Headphones, label: t("Audio", "Áudio"), path: "/audiobook", bg: "bg-violet-500/15", color: "text-violet-400" },
    { icon: GraduationCap, label: t("Modules", "Módulos"), path: "/modules", bg: "bg-amber-500/15", color: "text-amber-400" },
    // Row 2 — Growth
    { icon: Trophy, label: t("Badges", "Medalhas"), path: "/achievements", bg: "bg-yellow-500/15", color: "text-yellow-400" },
    { icon: TrendingUp, label: t("Progress", "Progresso"), path: "/progress", bg: "bg-cyan-500/15", color: "text-cyan-400" },
    { icon: Zap, label: "Flashcards", path: "/flashcards", bg: "bg-orange-500/15", color: "text-orange-400" },
    { icon: Brain, label: t("AI Insights", "Insights IA"), path: "/insights", bg: "bg-sky-500/15", color: "text-sky-400" },
    // Row 3 — Deeper Tools
    { icon: Calendar, label: t("Week Review", "Revisão Sem."), path: "/weekly-review", bg: "bg-cyan-500/15", color: "text-cyan-400" },
    { icon: BarChart3, label: t("Month Report", "Rel. Mensal"), path: "/monthly-report", bg: "bg-teal-500/15", color: "text-teal-400" },
    { icon: Sprout, label: t("Sow & Reap", "Semear"), path: "/sowing-reaping", bg: "bg-green-500/15", color: "text-green-400" },
    { icon: Shield, label: t("Bias Clear", "Limpar Viés"), path: "/bias-clearing", bg: "bg-purple-500/15", color: "text-purple-400" },
    // Row 4 — Community & Philosophy
    { icon: Users, label: t("Tribe", "Tribo"), path: "/inner-circle", bg: "bg-indigo-500/15", color: "text-indigo-400" },
    { icon: Star, label: t("Challenges", "Desafios"), path: "/challenges", bg: "bg-pink-500/15", color: "text-pink-400" },
    { icon: ScrollText, label: t("Philosophy", "Filosofia"), path: "/philosophy", bg: "bg-emerald-500/15", color: "text-emerald-400" },
    { icon: Settings, label: t("Settings", "Config."), path: "/settings", bg: "bg-gray-500/15", color: "text-gray-400" },
  ], [t]);

  return (
    <>
      {showFirstImpression && (
        <FirstImpression onBegin={handleFirstImpressionComplete} />
      )}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
      )}
      {showInitialCalibration && (
        <InitialCalibration open={showInitialCalibration} onComplete={handleCalibrationComplete} />
      )}

      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background">
        {/* Section 1: Compact Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background px-4 pt-5 pb-4">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative">
            <h1 className="text-lg font-bold">
              {greeting}, {t("Captain", "Capitão")}.
            </h1>
            {destinyScore?.score !== null && destinyScore?.score !== undefined ? (
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted-foreground">
                  ⚡ {t("Destiny Score", "Pontuação Destino")}: <strong className="text-primary">{destinyScore.score}%</strong>
                </span>
                {streak > 0 && (
                  <span className="text-sm text-muted-foreground">
                    🔥 {t("Day", "Dia")} <strong className="text-primary">{streak}</strong>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {t("Begin your journey. Calibrate your 15 axes.", "Comece sua jornada. Calibre seus 15 eixos.")}
              </p>
            )}
          </div>
        </div>

        <div className="px-3 py-3 space-y-3 pb-28">
          {/* Section 2: Doctrine of the Week */}
          <DoctrineCard />

          {/* Section 3: Reflection Prompt of the Day */}
          {lowestAxis && (lowestAxis as any).reflectionPrompt && (
            <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">{(lowestAxis as any).emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs italic text-foreground leading-relaxed line-clamp-2">
                      "{(lowestAxis as any).reflectionPrompt}"
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      — {(lowestAxis as any).name || `${(lowestAxis as any).leftLabel} ↔ ${(lowestAxis as any).rightLabel}`} · {(lowestAxis as any).value}/100
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 7: Today's Intention (compact single-line banner) */}
          {todayCycle?.intendedAction && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border/50">
              <span className="text-sm flex-shrink-0">🎯</span>
              <p className="text-xs text-foreground truncate">
                {t("Today", "Hoje")}: "{todayCycle.intendedAction}"
              </p>
            </div>
          )}

          {/* Section 4: Daily Cycle (kept as-is) */}
          <div className="space-y-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {t("Daily Cycle", "Ciclo Diário")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/daily-cycle?phase=morning">
                <Card className={`p-2.5 text-center hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer ${todayCycle?.morningCompletedAt ? "bg-primary/10 border-primary/30" : "border-border/50"}`}>
                  <div className="text-xl mb-0.5">🌅</div>
                  <p className="text-[10px] font-medium">{t("Morning", "Manhã")}</p>
                  {todayCycle?.morningCompletedAt && (
                    <div className="w-3.5 h-3.5 rounded-full bg-primary mx-auto mt-0.5 flex items-center justify-center">
                      <span className="text-[7px] text-primary-foreground">✓</span>
                    </div>
                  )}
                </Card>
              </Link>
              <Link href="/daily-cycle?phase=midday">
                <Card className={`p-2.5 text-center hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer ${todayCycle?.middayCompletedAt ? "bg-primary/10 border-primary/30" : "border-border/50"}`}>
                  <div className="text-xl mb-0.5">☀️</div>
                  <p className="text-[10px] font-medium">{t("Midday", "Meio-dia")}</p>
                  {todayCycle?.middayCompletedAt && (
                    <div className="w-3.5 h-3.5 rounded-full bg-primary mx-auto mt-0.5 flex items-center justify-center">
                      <span className="text-[7px] text-primary-foreground">✓</span>
                    </div>
                  )}
                </Card>
              </Link>
              <Link href="/daily-cycle?phase=evening">
                <Card className={`p-2.5 text-center hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer ${todayCycle?.eveningCompletedAt ? "bg-primary/10 border-primary/30" : "border-border/50"}`}>
                  <div className="text-xl mb-0.5">🌙</div>
                  <p className="text-[10px] font-medium">{t("Evening", "Noite")}</p>
                  {todayCycle?.eveningCompletedAt && (
                    <div className="w-3.5 h-3.5 rounded-full bg-primary mx-auto mt-0.5 flex items-center justify-center">
                      <span className="text-[7px] text-primary-foreground">✓</span>
                    </div>
                  )}
                </Card>
              </Link>
            </div>
          </div>

          {/* Continue Where You Left Off — compact chips */}
          {(hasLastListened || hasBookProgress) && (
            <div className="grid grid-cols-2 gap-2">
              {hasLastListened && lastListened && (
                <div
                  onClick={() => navigate(`/audiobook?chapter=${lastListened.chapterId}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 cursor-pointer hover:bg-violet-500/15 active:scale-[0.97] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-3.5 h-3.5 text-violet-400 ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-violet-300 truncate">
                      🎧 {language === "pt" ? "Cap" : "Ch"}.{lastListened.chapterNumber}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {formatTime(lastListened.currentPosition)}
                      {lastListened.audioDuration ? `/${formatTime(lastListened.audioDuration)}` : ""}
                    </p>
                  </div>
                </div>
              )}
              {hasBookProgress && pdfProgress && (
                <div
                  onClick={() => navigate("/book")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15 active:scale-[0.97] transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-emerald-300 truncate">
                      📖 {t("Page", "Pág.")} {pdfProgress.currentPage}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {t("of", "de")} {pdfProgress.totalPages}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Quick Navigate Grid — 4×4 icon grid */}
          <div className="space-y-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              {t("Navigate", "Navegar")}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-card border border-border/50 hover:shadow-md active:scale-95 transition-all">
                      <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-1`}>
                        <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                      </div>
                      <span className="text-[9px] font-medium text-center leading-tight text-muted-foreground">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Section 6: Invictus Footer */}
          <InvictusFooter />
        </div>
      </PullToRefresh>
    </>
  );
}
