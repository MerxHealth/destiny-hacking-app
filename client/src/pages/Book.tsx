import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Headphones, FileText, Download } from "lucide-react";
import { Link } from "wouter";

export function Book() {
  const { data: progress } = trpc.pdf.getProgress.useQuery();
  const { data: chapters } = trpc.pdf.listChapters.useQuery();

  const totalChapters = chapters?.length || 0;
  const currentPage = progress?.currentPage || 1;
  const totalPages = progress?.totalPages || 500; // Default estimate
  const percentComplete = progress?.percentComplete ? parseFloat(progress.percentComplete as any) : 0;

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
              Read the complete 500-page digital book with highlighting and notes
            </p>
          </div>
        </div>

        {/* Format Switcher */}
        <div className="flex gap-2">
          <Button variant="default" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Read
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/audiobook">
              <Headphones className="h-4 w-4" />
              Listen
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

      {/* Reading Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reading Progress</CardTitle>
          <CardDescription>
            Track your journey through the Destiny Hacking book
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

      {/* PDF Viewer Placeholder */}
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-muted">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">PDF Viewer Coming Soon</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              The embedded PDF viewer with highlighting, bookmarks, and note-taking features is currently in development.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button asChild>
                <Link href="/modules">
                  Start Interactive Modules
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Navigation */}
      {chapters && chapters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Chapters</h2>
          <div className="grid gap-4">
            {chapters.map((chapter: any) => (
              <Card key={chapter.id} className="cursor-pointer hover:shadow-md transition-all">
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
                      </div>
                      <CardTitle className="text-xl">{chapter.title}</CardTitle>
                      {chapter.description && (
                        <CardDescription className="mt-2">
                          {chapter.description}
                        </CardDescription>
                      )}
                    </div>
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
