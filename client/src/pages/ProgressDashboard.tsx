import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Headphones, 
  FileText, 
  TrendingUp,
  Clock,
  Target,
  Award
} from "lucide-react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function ProgressDashboard() {
  const { data: pdfProgress } = trpc.pdf.getProgress.useQuery();
  const { data: chapters } = trpc.pdf.listChapters.useQuery();
  const { data: audiobookChapters } = trpc.audiobook.listChapters.useQuery();
  const { data: modulesWithProgress } = trpc.modules.list.useQuery();

  // Calculate overall progress
  const totalChapters = chapters?.length || 14;
  const totalPages = 87;
  const pdfPagesRead = pdfProgress?.currentPage || 0;
  const pdfPercentComplete = (pdfPagesRead / totalPages) * 100;

  // Audiobook progress
  const completedAudioChapters = audiobookChapters?.filter((ch: any) => {
    // Check if chapter is completed (simplified - would need actual progress data)
    return false; // Placeholder
  }).length || 0;
  const audioPercentComplete = (completedAudioChapters / totalChapters) * 100;

  // Module progress
  const completedModules = modulesWithProgress?.filter((m: any) => m.progress?.status === 'completed').length || 0;
  const totalModules = modulesWithProgress?.length || 14;
  const modulePercentComplete = (completedModules / totalModules) * 100;

  // Overall completion (average of all three)
  const overallCompletion = (pdfPercentComplete + audioPercentComplete + modulePercentComplete) / 3;

  // Data for pie chart
  const chartData = [
    { name: 'Completed', value: overallCompletion, color: '#01D98D' },
    { name: 'Remaining', value: 100 - overallCompletion, color: '#e5e7eb' },
  ];

  // Format-specific data for detailed view
  const formatData = [
    {
      name: 'PDF Book',
      icon: BookOpen,
      progress: pdfPercentComplete,
      current: `Page ${pdfPagesRead}`,
      total: `${totalPages} pages`,
      link: '/book',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Audiobook',
      icon: Headphones,
      progress: audioPercentComplete,
      current: `${completedAudioChapters} chapters`,
      total: `${totalChapters} chapters`,
      link: '/audiobook',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Practice Modules',
      icon: FileText,
      progress: modulePercentComplete,
      current: `${completedModules} completed`,
      total: `${totalModules} modules`,
      link: '/modules',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  // Estimated time remaining (rough calculation)
  const pdfHoursRemaining = Math.ceil((totalPages - pdfPagesRead) / 20); // ~20 pages/hour
  const audioHoursRemaining = (totalChapters - completedAudioChapters) * 0.5; // ~30 min/chapter
  const moduleHoursRemaining = (totalModules - completedModules) * 0.25; // ~15 min/module
  const totalHoursRemaining = pdfHoursRemaining + audioHoursRemaining + moduleHoursRemaining;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Learning Progress</h1>
            <p className="text-muted-foreground">
              Track your journey across all learning formats
            </p>
          </div>
        </div>
      </div>

      {/* Overall Progress Card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Overall Completion</CardTitle>
          <CardDescription>
            Your combined progress across PDF, audiobook, and practice modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {overallCompletion.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{totalHoursRemaining.toFixed(0)}h</div>
                        <div className="text-xs text-muted-foreground">Remaining</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{totalChapters}</div>
                        <div className="text-xs text-muted-foreground">Chapters</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Milestones
                </h3>
                <div className="space-y-2">
                  {overallCompletion >= 25 && (
                    <Badge variant="secondary" className="w-full justify-start gap-2">
                      ✓ 25% Complete - Getting Started
                    </Badge>
                  )}
                  {overallCompletion >= 50 && (
                    <Badge variant="secondary" className="w-full justify-start gap-2">
                      ✓ 50% Complete - Halfway There
                    </Badge>
                  )}
                  {overallCompletion >= 75 && (
                    <Badge variant="secondary" className="w-full justify-start gap-2">
                      ✓ 75% Complete - Almost Done
                    </Badge>
                  )}
                  {overallCompletion >= 100 && (
                    <Badge variant="default" className="w-full justify-start gap-2">
                      🎉 100% Complete - Master!
                    </Badge>
                  )}
                  {overallCompletion < 25 && (
                    <Badge variant="outline" className="w-full justify-start gap-2">
                      Next: Reach 25% completion
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format-Specific Progress */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Progress by Format</h2>
        <div className="grid gap-4">
          {formatData.map((format) => {
            const Icon = format.icon;
            return (
              <Card key={format.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${format.bgColor}`}>
                        <Icon className={`h-6 w-6 ${format.color}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{format.name}</h3>
                          <span className="text-sm font-medium">
                            {format.progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={format.progress} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{format.current}</span>
                          <span>{format.total}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={format.link}>
                        Resume
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/book">
              <BookOpen className="h-4 w-4" />
              Read Book
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/audiobook">
              <Headphones className="h-4 w-4" />
              Listen to Audiobook
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/modules">
              <FileText className="h-4 w-4" />
              Practice Modules
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
