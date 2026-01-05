import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Headphones
} from "lucide-react";
import { toast } from "sonner";

export function VoiceCloning() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceName, setVoiceName] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: voiceModels, isLoading } = trpc.voice.listModels.useQuery();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success("Recording stopped");
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUpload = async () => {
    if (!audioBlob || !voiceName.trim()) {
      toast.error("Please record audio and provide a voice name");
      return;
    }

    // TODO: Implement actual upload to S3 and voice cloning API integration
    toast.info("Voice cloning upload feature coming soon");
  };

  const minDuration = 600; // 10 minutes
  const maxDuration = 900; // 15 minutes
  const isValidDuration = recordingDuration >= minDuration && recordingDuration <= maxDuration;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Voice Cloning</h1>
            <p className="text-muted-foreground">
              Clone your voice to narrate the Destiny Hacking audiobook
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Recording Guidelines:</strong> Record 10-15 minutes of clear audio reading from the book manuscript. 
          Speak naturally in a quiet environment. Your voice will be used to generate the complete audiobook narration.
        </AlertDescription>
      </Alert>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Record Voice Sample</CardTitle>
          <CardDescription>
            Record a 10-15 minute sample for voice cloning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-mono font-bold">
                {formatDuration(recordingDuration)}
              </div>
              <div className="text-sm text-muted-foreground">
                Target: 10-15 minutes
              </div>
            </div>

            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="gap-2 h-16 px-8"
                >
                  <Mic className="h-5 w-5" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="gap-2 h-16 px-8"
                >
                  <Square className="h-5 w-5" />
                  Stop Recording
                </Button>
              )}
            </div>

            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording in progress...</span>
              </div>
            )}
          </div>

          {/* Duration Progress */}
          {recordingDuration > 0 && (
            <div className="space-y-2">
              <Progress 
                value={(recordingDuration / maxDuration) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0:00</span>
                <span>10:00 (min)</span>
                <span>15:00 (max)</span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {audioUrl && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isValidDuration ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    Recording: {formatDuration(recordingDuration)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {!isValidDuration && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Recording should be between 10-15 minutes for optimal voice cloning quality.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Form */}
          {audioBlob && isValidDuration && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="voiceName">Voice Model Name</Label>
                <Input
                  id="voiceName"
                  placeholder="e.g., My Voice"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                />
              </div>

              <Button
                onClick={handleUpload}
                className="w-full gap-2"
                disabled={!voiceName.trim()}
              >
                <Upload className="h-4 w-4" />
                Upload & Create Voice Model
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Voice Models */}
      <Card>
        <CardHeader>
          <CardTitle>Your Voice Models</CardTitle>
          <CardDescription>
            Manage your cloned voice models
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !voiceModels || voiceModels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No voice models yet. Record your first sample above.
            </div>
          ) : (
            <div className="space-y-4">
              {voiceModels.map((model: any) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{model.modelName}</div>
                      <div className="text-sm text-muted-foreground">
                        Created {new Date(model.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      model.status === "ready"
                        ? "default"
                        : model.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {model.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
