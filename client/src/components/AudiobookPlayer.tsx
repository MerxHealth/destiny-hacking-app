import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Bookmark,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Timer,
  X,
  ListEnd
} from "lucide-react";
import { toast } from "sonner";
import { getChapterTitle } from "@shared/chapterTranslations";

interface AudiobookPlayerProps {
  chapterId: number;
  language: "en" | "pt";
  onChapterChange?: (newChapterId: number) => void;
  onChapterEnded?: () => void;
}

export function AudiobookPlayer({ chapterId, language, onChapterChange, onChapterEnded }: AudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [syncMode, setSyncMode] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0); // seconds
  const [autoPlay, setAutoPlay] = useState(() => {
    return localStorage.getItem('audiobook-autoplay') !== 'false'; // default true
  });

  // Track whether we've already restored position for this chapter+language combo
  // This prevents the progress query from repeatedly resetting currentTime during playback
  const hasRestoredPosition = useRef(false);
  const currentChapterLanguageKey = useRef("");

  // Fetch chapter data
  const { data: chapter } = trpc.audiobook.getChapter.useQuery({ chapterId });
  const { data: progress } = trpc.audiobook.getProgress.useQuery({ chapterId });

  // Determine the correct audio URL based on language
  const audioUrl = chapter
    ? language === "pt"
      ? (chapter as any).audioUrlPt || (chapter as any).audioUrl
      : (chapter as any).audioUrl
    : null;

  // Update progress mutation - don't invalidate the query to avoid re-triggering position restore
  const updateProgress = trpc.audiobook.updateProgress.useMutation();
  const utils = trpc.useUtils();

  // Create bookmark mutation
  const createBookmark = trpc.audiobook.createBookmark.useMutation({
    onSuccess: () => {
      toast.success("Bookmark added");
    },
  });

  // Reset the restore flag when chapter or language changes
  useEffect(() => {
    const key = `${chapterId}-${language}`;
    if (currentChapterLanguageKey.current !== key) {
      hasRestoredPosition.current = false;
      currentChapterLanguageKey.current = key;
    }
  }, [chapterId, language]);

  // Load saved position ONLY ONCE when chapter first loads
  // This runs when progress data arrives, but only restores position once per chapter+language
  useEffect(() => {
    if (progress && audioRef.current && !hasRestoredPosition.current) {
      const savedPosition = progress.currentPosition || 0;
      // Only restore if we have a meaningful saved position
      if (savedPosition > 0) {
        audioRef.current.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      }
      setPlaybackSpeed(parseFloat(progress.playbackSpeed as any) || 1.0);
      hasRestoredPosition.current = true;
    }
  }, [progress]);

  // Handle language change - pause and reset when language switches
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      // After the new source loads, resume if was playing
      if (wasPlaying) {
        const handleCanPlay = () => {
          audioRef.current?.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Autoplay might be blocked
          });
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  }, [language]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Save progress periodically - uses a ref to avoid stale closures
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlayingRef.current && audioRef.current) {
        const position = Math.floor(audioRef.current.currentTime);
        updateProgress.mutate({
          chapterId,
          currentPosition: position,
          playbackSpeed: playbackSpeedRef.current,
        });
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [chapterId]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimer === null) return;

    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          setSleepTimer(null);
          toast.info("Sleep timer expired - playback paused");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        toast.error("Unable to play audio");
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Broadcast position for sync mode
      if (syncMode && chapter) {
        localStorage.setItem('audiobook-sync', JSON.stringify({
          chapterId: chapter.id,
          chapterNumber: (chapter as any).chapterNumber,
          currentTime: audioRef.current.currentTime,
          duration: duration,
          timestamp: Date.now()
        }));
      }
    }
  }, [syncMode, chapter, duration]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      // Apply playback speed to newly loaded audio
      audioRef.current.playbackRate = playbackSpeedRef.current;
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  }, []);

  const handleAddBookmark = useCallback(() => {
    createBookmark.mutate({
      chapterId,
      position: Math.floor(currentTime),
      title: `Bookmark at ${formatTime(currentTime)}`,
    });
  }, [chapterId, currentTime]);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  }, [playbackSpeed]);

  const setSleepTimerMinutes = useCallback((minutes: number) => {
    setSleepTimer(minutes);
    setSleepTimerRemaining(minutes * 60);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepTimer(null);
    setSleepTimerRemaining(0);
    toast.info("Sleep timer cancelled");
  }, []);

  const formatTimerRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save progress when user pauses
  const saveCurrentPosition = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 0) {
      updateProgress.mutate({
        chapterId,
        currentPosition: Math.floor(audioRef.current.currentTime),
        playbackSpeed: playbackSpeedRef.current,
      });
    }
  }, [chapterId]);

  // Save position when component unmounts or chapter changes
  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.currentTime > 0) {
        // Fire-and-forget save on cleanup
        updateProgress.mutate({
          chapterId,
          currentPosition: Math.floor(audioRef.current.currentTime),
          playbackSpeed: playbackSpeedRef.current,
        });
      }
    };
  }, [chapterId]);

  // Save position before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioRef.current && audioRef.current.currentTime > 0) {
        // Use sendBeacon for reliable save on page close
        const data = JSON.stringify({
          chapterId,
          currentPosition: Math.floor(audioRef.current.currentTime),
          playbackSpeed: playbackSpeedRef.current,
        });
        navigator.sendBeacon?.('/api/trpc/audiobook.updateProgress', data);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [chapterId]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    updateProgress.mutate({
      chapterId,
      currentPosition: 0,
      playbackSpeed: playbackSpeedRef.current,
      completed: true,
    }, {
      onSuccess: () => {
        // Invalidate allProgress so the chapter list updates completion indicators
        utils.audiobook.getAllProgress.invalidate();
      },
    });
    // Auto-play next chapter after a short delay if enabled
    if (autoPlay && onChapterEnded) {
      toast.info(language === 'pt' ? 'Próximo capítulo...' : 'Next chapter...');
      setTimeout(() => onChapterEnded(), 1500);
    }
  }, [chapterId, onChapterEnded, autoPlay, language]);

  if (!chapter) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading chapter...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm leading-tight">
              {language === "pt" ? "Capítulo" : "Chapter"} {(chapter as any).chapterNumber}: {getChapterTitle((chapter as any).chapterNumber, language, (chapter as any).title)}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {language === "pt" ? `Capítulo ${(chapter as any).chapterNumber} de Destiny Hacking` : `Chapter ${(chapter as any).chapterNumber} of Destiny Hacking`}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {formatTime(duration)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => {
            setIsPlaying(false);
            saveCurrentPosition();
          }}
        />

        {/* Progress Bar */}
        <div className="space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChapterChange && onChapterChange(chapterId - 1)}
            disabled={!onChapterChange}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(-15)}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            onClick={togglePlay}
            className="h-14 w-14 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(15)}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChapterChange && onChapterChange(chapterId + 1)}
            disabled={!onChapterChange}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume Control - Collapsible row */}
        <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-9 text-right flex-shrink-0 font-mono">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Action Buttons - 2x2 grid for clear separation */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleSpeed}
            className="h-10 text-xs font-medium justify-start px-3"
          >
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            {language === 'pt' ? 'Velocidade' : 'Speed'}: {playbackSpeed}x
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddBookmark}
            className="h-10 text-xs font-medium justify-start px-3"
          >
            <Bookmark className="h-4 w-4 mr-2 flex-shrink-0" />
            {language === 'pt' ? 'Marcador' : 'Bookmark'}
          </Button>
          
          <Button
            variant={autoPlay ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const newVal = !autoPlay;
              setAutoPlay(newVal);
              localStorage.setItem('audiobook-autoplay', String(newVal));
              toast.success(newVal 
                ? (language === 'pt' ? 'Reprodução automática ativada' : 'Auto-play enabled')
                : (language === 'pt' ? 'Reprodução automática desativada' : 'Auto-play disabled'));
            }}
            className="h-10 text-xs font-medium justify-start px-3"
          >
            <ListEnd className="h-4 w-4 mr-2 flex-shrink-0" />
            {language === 'pt' ? 'Auto-reprodução' : 'Auto-play'}: {autoPlay ? 'ON' : 'OFF'}
          </Button>

          <Button
            variant={syncMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (!syncMode && chapter) {
                const pdfUrl = `/book?chapter=${(chapter as any).chapterNumber}&sync=true`;
                window.open(pdfUrl, 'pdf-sync', 'width=1200,height=800');
                setSyncMode(true);
                toast.success(language === 'pt' ? 'Modo sincronizado ativado' : 'Sync mode enabled - PDF will follow audio');
              } else {
                setSyncMode(false);
                toast.info(language === 'pt' ? 'Modo sincronizado desativado' : 'Sync mode disabled');
              }
            }}
            className="h-10 text-xs font-medium justify-start px-3"
          >
            <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
            {syncMode ? (language === 'pt' ? 'Sincronizando' : 'Syncing') : (language === 'pt' ? 'Acompanhar' : 'Follow Along')}
          </Button>
        </div>

        {/* Sleep Timer */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{language === 'pt' ? 'Temporizador' : 'Sleep Timer'}</span>
          </div>
          
          {sleepTimer === null ? (
            <div className="flex gap-1.5">
              {[5, 10, 15, 30, 60].map((m) => (
                <Button
                  key={m}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setSleepTimerMinutes(m)}
                >
                  {m}m
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm font-mono">
                {formatTimerRemaining(sleepTimerRemaining)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={cancelSleepTimer}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
