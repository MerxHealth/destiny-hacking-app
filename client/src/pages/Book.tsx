import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Headphones, Highlighter } from "lucide-react";
import { Link } from "wouter";
import { PDFViewer } from "@/components/PDFViewer";
import { HighlightsSidebar } from "@/components/HighlightsSidebar";
import { PageHeader } from "@/components/PageHeader";
import { getChapterTitle } from "@shared/chapterTranslations";

type BookLanguage = "en" | "pt";

const BOOK_LANGUAGE_KEY = "book-language";

const PDF_URLS: Record<BookLanguage, string> = {
  en: "https://d2xsxph8kpxj0f.cloudfront.net/111904132/fsRnWghWhaoD2r3KXXoRti/pdfs/destiny-hacking-book.pdf",
  pt: "https://d2xsxph8kpxj0f.cloudfront.net/111904132/fsRnWghWhaoD2r3KXXoRti/pdfs/destiny-hacking-book-pt.pdf",
};

const TOTAL_PAGES: Record<BookLanguage, number> = {
  en: 87,
  pt: 65,
};

export function Book() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const chapterParam = searchParams.get('chapter');
  
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHighlights, setShowHighlights] = useState(false);
  const [syncMode, setSyncMode] = useState(false);
  const [language, setLanguage] = useState<BookLanguage>(() => {
    const saved = localStorage.getItem(BOOK_LANGUAGE_KEY);
    return (saved === "pt" ? "pt" : "en") as BookLanguage;
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: progress } = trpc.pdf.getProgress.useQuery();
  const { data: chapters } = trpc.pdf.listChapters.useQuery();
  const updateProgressMutation = trpc.pdf.updateProgress.useMutation();

  const totalPages = TOTAL_PAGES[language];
  const displayPage = progress?.currentPage || currentPage;
  const percentComplete = (displayPage / totalPages) * 100;
  
  // Persist language preference
  const handleLanguageChange = (lang: BookLanguage) => {
    setLanguage(lang);
    localStorage.setItem(BOOK_LANGUAGE_KEY, lang);
    // Reset to page 1 when switching language since page numbers may differ
    setCurrentPage(1);
  };

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
    
    const syncParam = searchParams.get('sync');
    if (syncParam === 'true') {
      setSyncMode(true);
    }
  }, [chapterParam, chapters]);
  
  // Listen for audio sync updates
  useEffect(() => {
    if (!syncMode || !chapters) return;
    
    const checkSync = () => {
      const syncData = localStorage.getItem('audiobook-sync');
      if (!syncData) return;
      
      try {
        const { chapterNumber, currentTime, duration } = JSON.parse(syncData);
        const chapter = chapters.find((ch: any) => ch.chapterNumber === chapterNumber);
        if (!chapter || !chapter.pdfStartPage || !chapter.pdfEndPage) return;
        
        const chapterProgress = duration > 0 ? currentTime / duration : 0;
        const pagesInChapter = chapter.pdfEndPage - chapter.pdfStartPage + 1;
        const pageOffset = Math.floor(chapterProgress * pagesInChapter);
        const targetPage = chapter.pdfStartPage + pageOffset;
        
        if (targetPage !== currentPage && targetPage >= chapter.pdfStartPage && targetPage <= chapter.pdfEndPage) {
          setCurrentPage(targetPage);
        }
      } catch (e) {
        console.error('Sync error:', e);
      }
    };
    
    const interval = setInterval(checkSync, 1000);
    return () => clearInterval(interval);
  }, [syncMode, chapters, currentPage]);
  
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
    <div className="min-h-screen bg-background">
      <PageHeader
        title={language === "pt" ? "Ler Livro" : "Read Book"}
        subtitle={currentChapter 
          ? `Ch. ${currentChapter.chapterNumber} - ${getChapterTitle(currentChapter.chapterNumber, language, currentChapter.title)}` 
          : `${language === "pt" ? "Página" : "Page"} ${currentPage} ${language === "pt" ? "de" : "of"} ${totalPages}`
        }
        showBack
        rightAction={
          <div className="flex gap-1.5">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href={currentChapterNumber ? `/audiobook?chapter=${currentChapterNumber}` : "/audiobook"}>
                <Headphones className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant={showHighlights ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowHighlights(!showHighlights)}
              className="h-8 w-8"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="px-4 py-3 space-y-3">

      {/* Language Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-muted/60 rounded-full p-1 gap-0.5">
          <button
            onClick={() => handleLanguageChange("en")}
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
            onClick={() => handleLanguageChange("pt")}
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

      {/* Compact Reading Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Progress value={percentComplete} className="h-1.5" />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{percentComplete.toFixed(0)}%</span>
      </div>

      {/* PDF Viewer - Full height mobile-first */}
      <div className="relative">
        <Card className="h-[calc(100vh-260px)] border-border/50 overflow-hidden">
          <CardContent className="p-0 h-full">
            <PDFViewer
              pdfUrl={PDF_URLS[language]}
              initialPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
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
          </CardContent>
        </Card>
        
        {/* Highlights overlay */}
        {showHighlights && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <PageHeader
              title={language === "pt" ? "Destaques" : "Highlights"}
              subtitle={`${language === "pt" ? "Página" : "Page"} ${currentPage}`}
              showBack
              backPath="#"
              rightAction={
                <Button variant="ghost" size="sm" onClick={() => setShowHighlights(false)}>
                  {language === "pt" ? "Feito" : "Done"}
                </Button>
              }
            />
            <div className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
              <HighlightsSidebar 
                pageNumber={currentPage}
                onClose={() => setShowHighlights(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Compact Chapter Navigation */}
      {chapters && chapters.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {language === "pt" ? "Capítulos" : "Chapters"}
          </h2>
          <div className="space-y-1">
            {chapters.map((chapter: any) => (
              <Card 
                key={chapter.id} 
                className={`cursor-pointer active:scale-[0.98] transition-all ${
                  currentChapter?.id === chapter.id ? 'ring-1 ring-primary bg-primary/5' : 'border-border/50'
                }`}
                onClick={() => handleChapterClick(chapter)}
              >
                <div className="flex items-center gap-3 p-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    currentChapter?.id === chapter.id ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <span className="text-xs font-bold">{chapter.chapterNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getChapterTitle(chapter.chapterNumber, language, chapter.title)}
                    </p>
                    {chapter.pdfStartPage && (
                      <p className="text-[10px] text-muted-foreground">p. {chapter.pdfStartPage}-{chapter.pdfEndPage}</p>
                    )}
                  </div>
                  {currentChapter?.id === chapter.id && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
