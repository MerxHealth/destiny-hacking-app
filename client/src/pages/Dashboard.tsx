import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Calendar, Brain, Users, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your control panel...</p>
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
              Sign in to access your control panel for conscious will
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" asChild>
              <a href="/api/oauth/login">Sign In to Continue</a>
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              New here? Signing in will create your account automatically.
            </p>
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
              <h1 className="text-2xl font-bold">Destiny Hacking</h1>
              <p className="text-sm text-muted-foreground">Control Panel</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">
              Welcome back, {user.name?.split(' ')[0] || 'Pilot'}
            </h2>
            <p className="text-muted-foreground">
              Your command interface for conscious will. Choose your practice.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Emotional Sliders */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href="/sliders">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Gauge className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        Emotional Sliders
                      </CardTitle>
                      <CardDescription>
                        Calibrate your current emotional state across custom axes
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Last calibration: <span className="text-foreground font-medium">Not yet tracked</span>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Daily Cycle */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href="/daily-cycle">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-chart-1" />
                      </div>
                      <CardTitle className="group-hover:text-chart-1 transition-colors">
                        Daily Will Cycle
                      </CardTitle>
                      <CardDescription>
                        Morning calibration, decisive action, evening reflection
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-chart-1 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Today's status: <span className="text-foreground font-medium">Not started</span>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* AI Insights */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href="/insights">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        AI Insights
                      </CardTitle>
                      <CardDescription>
                        Pattern analysis and strategic observations from your Stoic coach
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Unread insights: <span className="text-foreground font-medium">0</span>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Inner Circle */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href="/inner-circle">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-chart-1" />
                      </div>
                      <CardTitle className="group-hover:text-chart-1 transition-colors">
                        Inner Circle
                      </CardTitle>
                      <CardDescription>
                        Mutual accountability with your invite-only practice group
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-chart-1 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Connections: <span className="text-foreground font-medium">0</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Getting Started */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                New to Destiny Hacking? Start with these foundational practices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium mb-1">Create Your First Emotional Axis</h4>
                  <p className="text-sm text-muted-foreground">
                    Define a bipolar emotional dimension (e.g., Fear ← → Courage). This becomes your calibration tool.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium mb-1">Complete Your First Daily Cycle</h4>
                  <p className="text-sm text-muted-foreground">
                    Morning: Calibrate. Midday: Commit to one action. Evening: Map cause-effect.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium mb-1">Review Your First AI Insight</h4>
                  <p className="text-sm text-muted-foreground">
                    After a few days of data, your Stoic strategist will identify patterns and suggest decisive actions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
