import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Download,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function PDFViewer({ pdfUrl, initialPage = 1, onPageChange, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync pageNumber when initialPage changes (e.g. language switch resets to page 1)
  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  // Measure container width for auto-fit
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        // Subtract padding (16px each side)
        const width = containerRef.current.clientWidth - 16;
        setContainerWidth(width > 0 ? width : null);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setIsLoading(false);
    toast.error(`Failed to load PDF: ${error.message}`);
    console.error("PDF load error:", error);
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const goToPage = (page: number) => {
    if (numPages && page >= 1 && page <= numPages) {
      setPageNumber(page);
      onPageChange?.(page);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  // Calculate the effective width: container width * scale
  const effectiveWidth = containerWidth ? containerWidth * scale : undefined;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Compact Controls Bar */}
      <div className="flex items-center justify-between gap-1 px-2 py-2 border-b border-border/50 bg-card">
        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1 || isLoading}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-12 h-8 text-center text-xs px-1"
              disabled={isLoading}
            />
            <span className="text-xs text-muted-foreground">
              / {numPages || "?"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages || isLoading}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5 || isLoading}
            className="h-8 w-8"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>

          <button
            onClick={resetZoom}
            disabled={isLoading}
            className="text-xs text-muted-foreground min-w-[40px] text-center hover:text-foreground transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3.0 || isLoading}
            className="h-8 w-8"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(pdfUrl, "_blank")}
            title="Fullscreen"
            className="h-8 w-8"
          >
            <Maximize className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = pdfUrl.includes("-pt") ? "destiny-hacking-book-pt.pdf" : "destiny-hacking-book.pdf";
              link.click();
            }}
            title="Download PDF"
            className="h-8 w-8"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* PDF Document - auto-fit width */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-muted/20 p-2">
        <div className="flex justify-center">
          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={
              <div className="text-center py-12">
                <p className="text-destructive font-medium">Failed to load PDF</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please check the PDF URL and try again
                </p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={effectiveWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg rounded-sm"
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
