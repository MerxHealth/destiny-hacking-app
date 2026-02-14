import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { AudiobookPlayer } from "@/components/AudiobookPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, BookOpen, FileText, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import { PageHeader } from "@/components/PageHeader";
import { getChapterTitle } from "@shared/chapterTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export function Audiobook() {
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const { data: chapters, isLoading } = trpc.audiobook.listChapters.useQuery();
  const { data: allProgress } = trpc.audiobook.getAllProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Build a map of chapterId -> progress for quick lookup
  const progressMap = useMemo(() => {
    if (!allProgress) return new Map<number, { currentPosition: number; completed: boolean }>();
    const map = new Map<number, { currentPosition: number; completed: boolean }>();
    for (const p of allProgress) {
      map.set(p.chapterId, {
        currentPosition: p.currentPosition,
        completed: p.completed,
      });
    }
    return map;
  }, [allProgress]);

  // Get current chapter number for format switching
  const currentChapter = chapters?.find((ch: any) => ch.id === selectedChapterId);
  const currentChapterNumber = currentChapter?.chapterNumber;

  // Calculate overall stats
  const completedCount = useMemo(() => {
    if (!allProgress) return 0;
    return allProgress.filter(p => p.completed).length;
  }, [allProgress]);

  const totalChapters = chapters?.length || 0;

  // Auto-select chapter from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterParam = urlParams.get('chapter');

    if (chapterParam && chapters && !selectedChapterId) {
      const chapterNumber = parseInt(chapterParam);
      const chapter = chapters.find((ch: any) => ch.chapterNumber === chapterNumber);
      if (chapter && chapter.audioUrl) {
        setSelectedChapterId(chapter.id);
      }
    }
  }, [chapters, selectedChapterId]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  // Handle chapter change from player (prev/next buttons)
  const handleChapterChange = (newId: number) => {
    const validChapter = chapters?.find(c => c.id === newId);
    if (validChapter) {
      setSelectedChapterId(newId);
    }
  };

  // Handle auto-play next chapter when current one ends
  const handleChapterEnded = () => {
    if (!chapters || !selectedChapterId) return;
    const currentIndex = chapters.findIndex(c => c.id === selectedChapterId);
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      if (nextChapter.audioUrl) {
        setSelectedChapterId(nextChapter.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={t("Audiobook", "Audiolivro")} subtitle={t("Listen to the complete book", "Ouça o livro completo")} showBack />
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">{t("Loading audiobook chapters...", "Carregando capítulos...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={t("Audiobook", "Audiolivro")}
        subtitle={t("Listen to the complete book", "Ouça o livro completo")}
        showBack
        rightAction={
          <div className="flex gap-1.5">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href={currentChapterNumber ? `/book?chapter=${currentChapterNumber}` : "/book"}>
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href={currentChapterNumber ? `/modules/${currentChapterNumber}` : "/modules"}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">

      {/* Language Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-muted/60 rounded-full p-1 gap-0.5">
          <button
            onClick={() => setLanguage("en")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              language === "en"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base leading-none">🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => setLanguage("pt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              language === "pt"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-base leading-none">🇧🇷</span>
            <span>Português</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Summary */}
      {isAuthenticated && totalChapters > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {t("Progress", "Progresso")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalChapters) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {completedCount}/{totalChapters}
            </span>
          </div>
        </div>
      )}

      {/* Current Player */}
      {selectedChapterId && (
        <AudiobookPlayer
          chapterId={selectedChapterId}
          language={language}
          onChapterChange={handleChapterChange}
          onChapterEnded={handleChapterEnded}
        />
      )}

      {/* Chapter List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("Chapters", "Capítulos")}</h2>
          <Badge variant="secondary">
            {chapters?.length || 0} {t("chapters", "capítulos")}
          </Badge>
        </div>

        {!chapters || chapters.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-muted">
                  <Headphones className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t("No Audiobook Chapters Yet", "Nenhum Capítulo Ainda")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("Clone your voice and generate audiobook narration to get started.", "Clone sua voz e gere a narração do audiolivro para começar.")}
                </p>
                <Button asChild>
                  <Link href="/voice-cloning">
                    {t("Set Up Voice Cloning", "Configurar Clonagem de Voz")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => {
              const isSelected = selectedChapterId === chapter.id;
              const hasAudio = language === "pt"
                ? !!(chapter as any).audioUrlPt || !!chapter.audioUrl
                : !!chapter.audioUrl;

              // Progress info for this chapter
              const chapterProgress = progressMap.get(chapter.id);
              const isCompleted = chapterProgress?.completed || false;
              const currentPos = chapterProgress?.currentPosition || 0;
              const chapterDuration = chapter.audioDuration || 0;
              const progressPercent = chapterDuration > 0 ? Math.min((currentPos / chapterDuration) * 100, 100) : 0;
              const hasStarted = currentPos > 0 && !isCompleted;

              return (
                <Card
                  key={chapter.id}
                  className={`cursor-pointer transition-all active:scale-[0.98] ${
                    isSelected ? "ring-2 ring-primary bg-primary/5" : "border-border/50"
                  } ${isCompleted ? "opacity-80" : ""}`}
                  onClick={() => hasAudio && setSelectedChapterId(chapter.id)}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Chapter Number / Status Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative ${
                      isCompleted
                        ? "bg-green-500/15"
                        : hasAudio
                          ? "bg-primary/15"
                          : "bg-muted"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : hasStarted ? (
                        <>
                          <span className="text-sm font-bold">{chapter.chapterNumber}</span>
                          {/* Circular progress ring */}
                          <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                            <circle
                              cx="20" cy="20" r="17"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-primary/30"
                            />
                            <circle
                              cx="20" cy="20" r="17"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray={`${2 * Math.PI * 17}`}
                              strokeDashoffset={`${2 * Math.PI * 17 * (1 - progressPercent / 100)}`}
                              className="text-primary transition-all duration-300"
                              strokeLinecap="round"
                            />
                          </svg>
                        </>
                      ) : (
                        <span className="text-sm font-bold">{chapter.chapterNumber}</span>
                      )}
                    </div>

                    {/* Chapter Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isCompleted ? "text-muted-foreground" : ""}`}>
                        {getChapterTitle(chapter.chapterNumber, language, chapter.title)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isCompleted ? (
                          <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("Completed", "Concluído")}
                          </span>
                        ) : hasStarted ? (
                          <span className="text-[10px] text-primary flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" />
                            {t("In Progress", "Em Progresso")} — {Math.round(progressPercent)}%
                          </span>
                        ) : hasAudio ? (
                          <span className="text-[10px] text-primary flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("Ready", "Pronto")}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">{t("Not generated", "Não gerado")}</span>
                        )}
                        {hasAudio && chapter.audioDuration && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {hasStarted
                              ? `${formatDuration(currentPos)} / ${formatDuration(chapter.audioDuration)}`
                              : formatDuration(chapter.audioDuration)
                            }
                          </span>
                        )}
                      </div>

                      {/* Progress bar for in-progress chapters */}
                      {hasStarted && chapterDuration > 0 && (
                        <div className="mt-1.5 w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right indicator */}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
