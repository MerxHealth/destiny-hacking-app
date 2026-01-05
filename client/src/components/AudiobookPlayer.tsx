import { useState, useRef, useEffect } from "react";
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
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface AudiobookPlayerProps {
  chapterId: number;
  onChapterChange?: (newChapterId: number) => void;
}

export function AudiobookPlayer({ chapterId, onChapterChange }: AudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Fetch chapter data
  const { data: chapter } = trpc.audiobook.getChapter.useQuery({ chapterId });
  const { data: progress } = trpc.audiobook.getProgress.useQuery({ chapterId });

  const utils = trpc.useUtils();

  // Update progress mutation
  const updateProgress = trpc.audiobook.updateProgress.useMutation({
    onSuccess: () => {
      utils.audiobook.getProgress.invalidate({ chapterId });
    },
  });

  // Create bookmark mutation
  const createBookmark = trpc.audiobook.createBookmark.useMutation({
    onSuccess: () => {
      toast.success("Bookmark added");
    },
  });

  // Load saved position when chapter loads
  useEffect(() => {
    if (progress && audioRef.current) {
      audioRef.current.currentTime = progress.currentPosition || 0;
      setPlaybackSpeed(parseFloat(progress.playbackSpeed as any) || 1.0);
    }
  }, [progress, chapterId]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        const position = Math.floor(audioRef.current.currentTime);
        updateProgress.mutate({
          chapterId,
          currentPosition: position,
          playbackSpeed,
        });
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [isPlaying, chapterId, playbackSpeed]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleAddBookmark = () => {
    createBookmark.mutate({
      chapterId,
      position: Math.floor(currentTime),
      title: `Bookmark at ${formatTime(currentTime)}`,
    });
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Chapter {(chapter as any).chapterNumber}: {(chapter as any).title}
            </CardTitle>
            <CardDescription>{(chapter as any).description}</CardDescription>
          </div>
          <Badge variant="secondary">
            {formatTime(duration)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={(chapter as any).audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            updateProgress.mutate({
              chapterId,
              currentPosition: 0,
              playbackSpeed,
              completed: true,
            });
          }}
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
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
            className="h-16 w-16 rounded-full"
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

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Button
              variant="ghost"
              size="icon"
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
          </div>

          {/* Speed Control */}
          <Button
            variant="outline"
            size="sm"
            onClick={cycleSpeed}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {playbackSpeed}x
          </Button>

          {/* Bookmark */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddBookmark}
            className="gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Bookmark
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
