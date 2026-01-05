import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AudiobookPlayer } from "@/components/AudiobookPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, BookOpen, FileText, CheckCircle2, Circle, Clock } from "lucide-react";
import { Link } from "wouter";

export function Audiobook() {
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  const { data: chapters, isLoading } = trpc.audiobook.listChapters.useQuery();

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading audiobook chapters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Destiny Hacking Audiobook</h1>
            <p className="text-muted-foreground">
              Listen to the complete book narrated in your own voice
            </p>
          </div>
        </div>

        {/* Format Switcher */}
        <div className="flex gap-2">
          <Button variant="default" className="gap-2">
            <Headphones className="h-4 w-4" />
            Listen
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/book">
              <BookOpen className="h-4 w-4" />
              Read PDF
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/modules">
              <FileText className="h-4 w-4" />
              Practice
            </Link>
          </Button>
        </div>
      </div>

      {/* Current Player */}
      {selectedChapterId && (
        <AudiobookPlayer
          chapterId={selectedChapterId}
          onChapterChange={(newId) => {
            const validChapter = chapters?.find(c => c.id === newId);
            if (validChapter) {
              setSelectedChapterId(newId);
            }
          }}
        />
      )}

      {/* Chapter List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Chapters</h2>
          <Badge variant="secondary">
            {chapters?.length || 0} chapters
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
                <h3 className="text-lg font-semibold mb-2">No Audiobook Chapters Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Clone your voice and generate audiobook narration to get started.
                </p>
                <Button asChild>
                  <Link href="/voice-cloning">
                    Set Up Voice Cloning
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chapters.map((chapter) => {
              const isSelected = selectedChapterId === chapter.id;
              const hasAudio = !!chapter.audioUrl;

              return (
                <Card
                  key={chapter.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => hasAudio && setSelectedChapterId(chapter.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">
                            Chapter {chapter.chapterNumber}
                          </Badge>
                          {hasAudio ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Ready
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Circle className="h-3 w-3" />
                              Not Generated
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{chapter.title}</CardTitle>
                        {chapter.description && (
                          <CardDescription className="mt-2">
                            {chapter.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {hasAudio && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDuration(chapter.audioDuration)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {!hasAudio && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Audio not yet generated. Set up voice cloning to create narration for this chapter.
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
