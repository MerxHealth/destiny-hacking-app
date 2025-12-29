import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Calendar, Brain, Users, TrendingUp, CheckCircle2, Flame, Settings } from "lucide-react";
import { SliderHistoryChart } from "@/components/SliderHistoryChart";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  // Fetch data
  const { data: todayCycle } = trpc.dailyCycle.getToday.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: recentCycles } = trpc.dailyCycle.getHistory.useQuery(
    { days: 30 },
    { enabled: !!user }
  );

  const { data: axes } = trpc.sliders.listAxes.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: latestStates } = trpc.sliders.getLatestStates.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: insights } = trpc.insights.list.useQuery(
    { limit: 5 },
    { enabled: !!user }
  );

  // Calculate streak
  const calculateStreak = () => {
    if (!recentCycles || recentCycles.length === 0) return 0;
    
    const sortedCycles = [...recentCycles]
      .filter(c => c.isComplete)
      .sort((a, b) => new Date(b.cycleDate).getTime() - new Date(a.cycleDate).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedCycles.length; i++) {
      const cycleDate = new Date(sortedCycles[i].cycleDate);
      cycleDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (cycleDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();
  const unreadInsights = insights?.filter(i => !i.isRead).length || 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Destiny Hacking</CardTitle>
            <CardDescription>
              Sign in to start calibrating your emotional state and operationalizing free will
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" asChild>
              <a href="/api/oauth/login">Sign In</a>
            </Button>
            <div className="text-center">
              <Link href="/">
                <Button variant="link" className="text-sm">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Control Panel</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak} days</div>
              <p className="text-xs text-muted-foreground">
                {streak > 0 ? "Keep going!" : "Start today"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Emotional Axes</CardTitle>
              <Gauge className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{axes?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active dimensions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Cycles</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentCycles?.filter(c => c.isComplete).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Insights</CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadInsights}</div>
              <p className="text-xs text-muted-foreground">
                Unread observations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Cycle Status */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Practice</CardTitle>
            <CardDescription>Your daily will cycle progress</CardDescription>
          </CardHeader>
          <CardContent>
            {!todayCycle ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">You haven't started today's cycle yet.</p>
                <Button asChild>
                  <Link href="/daily-cycle">Start Morning Calibration</Link>
                </Button>
              </div>
            ) : todayCycle.isComplete ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <p className="font-medium">Today's cycle complete!</p>
                  <p className="text-sm text-muted-foreground">
                    You've operationalized your free will today.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/insights">View Insights</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`flex-1 h-2 rounded-full ${todayCycle.morningCompletedAt ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`flex-1 h-2 rounded-full ${todayCycle.middayCompletedAt ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`flex-1 h-2 rounded-full ${todayCycle.eveningCompletedAt ? 'bg-primary' : 'bg-muted'}`} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className={todayCycle.morningCompletedAt ? 'text-primary' : 'text-muted-foreground'}>
                    Morning ✓
                  </span>
                  <span className={todayCycle.middayCompletedAt ? 'text-primary' : 'text-muted-foreground'}>
                    Midday {todayCycle.middayCompletedAt ? '✓' : ''}
                  </span>
                  <span className={todayCycle.eveningCompletedAt ? 'text-primary' : 'text-muted-foreground'}>
                    Evening {todayCycle.eveningCompletedAt ? '✓' : ''}
                  </span>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/daily-cycle">Continue Cycle</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emotional State Overview */}
        {latestStates && latestStates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Emotional State</CardTitle>
              <CardDescription>Latest calibrations across all axes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestStates.map((state) => {
                  const axis = axes?.find(a => a.id === state.axisId);
                  if (!axis) return null;

                  return (
                    <div key={state.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {axis.leftLabel} ← → {axis.rightLabel}
                        </span>
                        <span className="text-primary font-bold">{state.value}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${state.value}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(state.clientTimestamp).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emotional Trends Chart */}
        <SliderHistoryChart />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/sliders">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Emotional Sliders</CardTitle>
                <CardDescription className="text-xs">
                  Calibrate your current state
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/daily-cycle">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Daily Cycle</CardTitle>
                <CardDescription className="text-xs">
                  Morning → Midday → Evening
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/insights">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">AI Insights</CardTitle>
                <CardDescription className="text-xs">
                  Pattern analysis & strategy
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/inner-circle">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Inner Circle</CardTitle>
                <CardDescription className="text-xs">
                  Connections & accountability
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Settings</CardTitle>
                <CardDescription className="text-xs">
                  Notifications & preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Insights */}
        {insights && insights.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Insights</CardTitle>
                  <CardDescription>AI-generated observations</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/insights">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{insight.title}</div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {insight.content}
                        </p>
                      </div>
                      {!insight.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
