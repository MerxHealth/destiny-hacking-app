import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Flame, Users } from "lucide-react";

interface ChallengeLeaderboardProps {
  challengeId: number;
}

export function ChallengeLeaderboard({ challengeId }: ChallengeLeaderboardProps) {
  const { data: stats } = trpc.challenges.getStats.useQuery({ challengeId });

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Group Progress</CardTitle>
          <CardDescription>Loading stats...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { participants, totalCompletions, averageStreak, topStreak } = stats as any;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Group Progress
            </CardTitle>
            <CardDescription>Collective accountability metrics</CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {participants} Members
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <p className="text-sm font-medium text-muted-foreground">Top Streak</p>
            </div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {topStreak} days
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-medium text-muted-foreground">Avg Streak</p>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {averageStreak.toFixed(1)} days
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Completions</p>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {totalCompletions}
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Group Completion Rate</p>
            <p className="text-sm text-muted-foreground">
              {participants > 0 ? Math.round((totalCompletions / participants) * 100) : 0}%
            </p>
          </div>
          <Progress 
            value={participants > 0 ? (totalCompletions / participants) * 100 : 0} 
            className="h-3"
          />
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Privacy First:</strong> This leaderboard shows collective progress only. 
            Individual emotional states and personal reflections remain private.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
