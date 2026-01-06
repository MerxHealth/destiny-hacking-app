import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, Pause, Upload, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SAMPLE_TEXT = `**Sample 1: Narrative Style**

The concept of free will has puzzled philosophers for centuries. Yet the practical application of choice remains surprisingly simple. Every decision we make creates a ripple effect that extends far beyond the immediate moment. When we understand this principle, we begin to see our lives not as random events, but as the cumulative result of thousands of small choices.

Consider the morning routine. Most people wake up and immediately react to their environment. They check their phone, respond to notifications, and allow external forces to dictate their emotional state. But what if we approached each morning differently? What if we recognized that the first hour of our day sets the trajectory for everything that follows?

**Sample 2: Instructional Style**

Let me walk you through a practical exercise. First, identify one area of your life where you feel stuck. This could be a relationship, a career decision, or a personal habit. Now, instead of asking 'Why is this happening to me?' ask a different question: 'What am I choosing that creates this result?'

This shift in perspective is crucial. It moves you from victim to architect. You're no longer at the mercy of circumstances. You're the one holding the blueprint. The power was always yours—you simply forgot you had it.

**Sample 3: Reflective Style**

I remember the moment I realized that my emotions were not happening to me, but were being created by me. It was a Tuesday morning, and I was angry about something trivial. As I sat with that anger, I noticed something strange. The anger wasn't constant. It would flare up when I thought certain thoughts, then fade when my mind wandered elsewhere.

This observation changed everything. If my thoughts controlled my emotions, and I controlled my thoughts, then I controlled my emotions. The logic was simple, but the implications were profound. I wasn't a passenger in my own life. I was the driver.`;

export function RecordVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const targetDuration = 3 * 60; // 3 minutes minimum
  const progress = Math.min((recordingTime / targetDuration) * 100, 100);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    try {
      setUploadProgress(10);
      
      // Convert to FormData
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-sample.webm");

      setUploadProgress(30);

      // Upload to server
      const response = await fetch("/api/upload-voice-sample", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      setUploadProgress(100);
      setIsUploaded(true);

      // Show success message
      alert("Voice sample uploaded successfully! You can now proceed to generate the audiobook.");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Record Your Voice</h1>
            <p className="text-muted-foreground">
              Record yourself reading the sample text below (3-5 minutes is sufficient)
            </p>
        </div>

        {/* Recording Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Recording</CardTitle>
            <CardDescription>
              Click "Start Recording" and read the sample text in your natural narration voice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer and Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatTime(recordingTime)}</span>
                <span className="text-sm text-muted-foreground">
                  Target: {formatTime(targetDuration)} (minimum)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              {recordingTime >= targetDuration && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Minimum duration reached! You can stop recording now.
                </p>
              )}
            </div>

            {/* Recording Buttons */}
            <div className="flex gap-4">
              {!isRecording && !audioBlob && (
                <Button onClick={startRecording} size="lg" className="gap-2">
                  <Mic className="h-5 w-5" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2">
                  <Square className="h-5 w-5" />
                  Stop Recording
                </Button>
              )}

              {audioBlob && !isUploaded && (
                <>
                  <Button onClick={togglePlayback} size="lg" variant="outline" className="gap-2">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    {isPlaying ? "Pause" : "Play"} Recording
                  </Button>

                  <Button 
                    onClick={uploadRecording} 
                    size="lg" 
                    className="gap-2"
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    <Upload className="h-5 w-5" />
                    Upload Recording
                  </Button>

                  <Button 
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setRecordingTime(0);
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.pause();
                        audioPlayerRef.current = null;
                      }
                    }} 
                    size="lg" 
                    variant="ghost"
                  >
                    Re-record
                  </Button>
                </>
              )}

              {isUploaded && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="font-semibold">Recording uploaded successfully!</span>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Text */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Text to Read</CardTitle>
            <CardDescription>
              Read this text naturally, as if narrating your book. Take your time and speak clearly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {SAMPLE_TEXT}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Recording Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Find a quiet space with minimal background noise</li>
              <li>• Speak in your natural narration voice (the same tone you'll use for the audiobook)</li>
              <li>• Read at a comfortable pace - not too fast, not too slow</li>
              <li>• Aim for 3-5 minutes of recording time (minimum 3 minutes)</li>
              <li>• You can pause between samples if needed</li>
              <li>• Listen to your recording before uploading to ensure quality</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
