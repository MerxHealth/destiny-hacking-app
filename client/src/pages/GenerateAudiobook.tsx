import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Play, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";

const CHAPTERS = [
  { number: 1, title: "The Divine Gift: The Awesome Power and Terrifying Responsibility of Free Will" },
  { number: 2, title: "The Unbreakable Law of Your Reality" },
  { number: 3, title: "The Unfair Advantage: How to Find Meaning in a World of Unfairness" },
  { number: 4, title: "The Gravity of Choice: Navigating the Roles of Abuser and Victim" },
  { number: 5, title: "The Crossroads of Choice: The Terrible Cost of Indecision" },
  { number: 6, title: "The Phoenix Moment: Rising from the Ashes of Your Past" },
  { number: 7, title: "Marcus Aurelius and the Stoic Path to Inner Freedom" },
  { number: 8, title: "The Weight of Your Will: The Radical Power of Taking Responsibility" },
  { number: 9, title: "The Alchemy of Will: Turning Suffering into Strength" },
  { number: 10, title: "The Surfer and the Wave: The Dance of Free Will and Universal Laws" },
  { number: 11, title: "The Paradox of Prayer: Does Asking for Help Undermine Free Will?" },
  { number: 12, title: "The Myth of the Lone Genius: Why Your Will Needs a Tribe" },
  { number: 13, title: "The Architect of Destiny: How Your Daily Choices Build Your Life" },
  { number: 14, title: "Your Invictus Moment: The Captain of Your Soul" },
];

export function GenerateAudiobook() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [voiceRecordingUrl, setVoiceRecordingUrl] = useState<string>("");

  const generateMutation = trpc.audiobook.generateAllChapters.useMutation({
    onSuccess: () => {
      setIsGenerating(false);
      setCurrentChapter(null);
      alert("All 14 chapters generated successfully!");
    },
    onError: (error: any) => {
      setIsGenerating(false);
      setError(error.message);
    },
  });

  const handleGenerateAll = async () => {
    if (!voiceRecordingUrl) {
      alert("Please enter the voice recording URL first.");
      return;
    }

    if (!confirm("This will generate all 14 audiobook chapters using your cloned voice. This may take 30-60 minutes. Continue?")) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCompletedChapters(new Set());
    setCurrentChapter(1);

    try {
      // Call the backend to generate all chapters
      await generateMutation.mutateAsync({ voiceRecordingUrl });
    } catch (e) {
      console.error("Generation error:", e);
    }
  };

  const progress = completedChapters.size / CHAPTERS.length * 100;

  // Check if user is admin/owner
  if (!user || user.openId !== import.meta.env.VITE_OWNER_OPEN_ID) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is only accessible to the app owner.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Generate Complete Audiobook</h1>
          <p className="text-muted-foreground">
            Generate audio narration for all 14 chapters using your cloned voice
          </p>
        </div>

        {/* Generation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Audiobook Generation</CardTitle>
            <CardDescription>
              This will use your uploaded voice recording to generate narration for all chapters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress */}
            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Generating Chapter {currentChapter} of {CHAPTERS.length}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {completedChapters.size}/{CHAPTERS.length} completed
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating audio... This may take several minutes per chapter.</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Generation Error</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            {/* Voice Recording URL Input */}
            {!isGenerating && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Recording URL</label>
                <input
                  type="url"
                  value={voiceRecordingUrl}
                  onChange={(e) => setVoiceRecordingUrl(e.target.value)}
                  placeholder="https://your-bucket.s3.amazonaws.com/voice-samples/recording.webm"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the S3 URL of your uploaded voice recording from Step 1
                </p>
              </div>
            )}

            {/* Generate Button */}
            {!isGenerating && (
              <Button 
                onClick={handleGenerateAll} 
                size="lg" 
                className="w-full gap-2"
                disabled={isGenerating || !voiceRecordingUrl}
              >
                <Play className="h-5 w-5" />
                Generate All 14 Chapters
              </Button>
            )}

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Estimated time: 30-60 minutes for all chapters</p>
              <p>• Each chapter will be generated sequentially</p>
              <p>• Audio files will be automatically uploaded to S3</p>
              <p>• Progress will be saved to the database</p>
              <p>• You can close this page and check back later</p>
            </div>
          </CardContent>
        </Card>

        {/* Chapter List */}
        <Card>
          <CardHeader>
            <CardTitle>Chapters ({CHAPTERS.length})</CardTitle>
            <CardDescription>All chapters from your manuscript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CHAPTERS.map((chapter) => (
                <div
                  key={chapter.number}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    completedChapters.has(chapter.number)
                      ? "bg-green-50 border-green-200"
                      : currentChapter === chapter.number
                      ? "bg-blue-50 border-blue-200"
                      : "bg-card"
                  }`}
                >
                  {completedChapters.has(chapter.number) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : currentChapter === chapter.number ? (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Chapter {chapter.number}</p>
                    <p className="text-sm text-muted-foreground">{chapter.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
