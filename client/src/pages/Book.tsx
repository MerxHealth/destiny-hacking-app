import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Headphones, FileText, Download, Highlighter } from "lucide-react";
import { Link } from "wouter";
import { PDFViewer } from "@/components/PDFViewer";
import { HighlightsSidebar } from "@/components/HighlightsSidebar";

export function Book() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const chapterParam = searchParams.get('chapter');
  
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHighlights, setShowHighlights] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: progress } = trpc.pdf.getProgress.useQuery();
  const { data: chapters } = trpc.pdf.listChapters.useQuery();
  const updateProgressMutation = trpc.pdf.updateProgress.useMutation();

  const totalChapters = chapters?.length || 0;
  const totalPages = 87; // Actual PDF page count
  const displayPage = progress?.currentPage || currentPage;
  const percentComplete = (displayPage / totalPages) * 100;
  
  // Initialize page from progress or chapter parameter
  useEffect(() => {
    if (progress?.currentPage && currentPage === 1) {
      setCurrentPage(progress.currentPage);
    }
  }, [progress]);
  
  // Jump to chapter if specified in URL
  useEffect(() => {
    if (chapterParam && chapters) {
      const chapterNum = parseInt(chapterParam);
      const chapter = chapters.find((ch: any) => ch.chapterNumber === chapterNum);
      if (chapter?.pdfStartPage) {
        setCurrentPage(chapter.pdfStartPage);
        setSelectedChapter(chapter.id);
      }
    }
  }, [chapterParam, chapters]);
  
  // Find current chapter based on page number
  const currentChapter = chapters?.find((ch: any) => 
    ch.pdfStartPage && ch.pdfEndPage && 
    displayPage >= ch.pdfStartPage && displayPage <= ch.pdfEndPage
  );
  
  const currentChapterNumber = currentChapter?.chapterNumber;
  
  const handleChapterClick = (chapter: any) => {
    if (chapter.pdfStartPage) {
      setCurrentPage(chapter.pdfStartPage);
      setSelectedChapter(chapter.id);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Destiny Hacking Book</h1>
            <p className="text-muted-foreground">
              Read the complete 87-page digital book with chapter navigation
            </p>
          </div>
        </div>

        {/* Format Switcher */}
        <div className="flex gap-2">
          <Button variant="default" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Read Book
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href={currentChapterNumber ? `/audiobook?chapter=${currentChapterNumber}` : "/audiobook"}>
              <Headphones className="h-4 w-4" />
              Listen
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/modules">
              <FileText className="h-4 w-4" />
              Practice
            </Link>
          </Button>
        </div>
      </div>

      {/* Reading Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Progress</CardTitle>
          <CardDescription>
            {currentChapter ? `Currently reading: Chapter ${currentChapter.chapterNumber} - ${currentChapter.title}` : 'Track your reading progress'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <span className="font-medium">{percentComplete.toFixed(0)}% complete</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalChapters}</div>
              <div className="text-sm text-muted-foreground">Total Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentPage}</div>
              <div className="text-sm text-muted-foreground">Current Page</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.ceil((totalPages - currentPage) / 20)}
              </div>
              <div className="text-sm text-muted-foreground">Hours Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer with Highlights */}
      <div className="flex gap-4">
        <Card className={`h-[800px] transition-all ${showHighlights ? 'flex-1' : 'w-full'}`}>
          <CardContent className="p-0 h-full flex flex-col">
            {/* Highlights Toggle */}
            <div className="p-4 border-b">
              <Button
                variant={showHighlights ? "default" : "outline"}
                onClick={() => setShowHighlights(!showHighlights)}
                className="gap-2"
              >
                <Highlighter className="h-4 w-4" />
                {showHighlights ? "Hide" : "Show"} Highlights
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <PDFViewer
                pdfUrl="/destiny-hacking-book.pdf"
                initialPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  
                  // Debounced auto-save (save after 2 seconds of no page changes)
                  if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                  }
                  
                  saveTimeoutRef.current = setTimeout(() => {
                    updateProgressMutation.mutate({
                      currentPage: page,
                      totalPages: totalPages,
                    });
                  }, 2000);
                }}
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Highlights Sidebar */}
        {showHighlights && (
          <HighlightsSidebar 
            pageNumber={currentPage}
            onClose={() => setShowHighlights(false)}
          />
        )}
      </div>

      {/* Chapter Navigation */}
      {chapters && chapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Chapters</h2>
          <div className="grid gap-4">
            {chapters.map((chapter: any) => (
              <Card 
                key={chapter.id} 
                className={`cursor-pointer hover:shadow-md transition-all ${
                  currentChapter?.id === chapter.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleChapterClick(chapter)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          Chapter {chapter.chapterNumber}
                        </Badge>
                        {chapter.pdfStartPage && chapter.pdfEndPage && (
                          <Badge variant="secondary">
                            Pages {chapter.pdfStartPage}-{chapter.pdfEndPage}
                          </Badge>
                        )}
                        {currentChapter?.id === chapter.id && (
                          <Badge variant="default">
                            Current
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/audiobook?chapter=${chapter.chapterNumber}`}>
                        <Headphones className="h-4 w-4 mr-2" />
                        Listen
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
