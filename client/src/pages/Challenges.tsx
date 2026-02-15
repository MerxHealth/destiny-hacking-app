import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Plus, Users, Calendar, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

export default function Challenges() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  // Fetch challenges
  const { data: challenges, isLoading: challengesLoading } = trpc.challenges.list.useQuery(
    undefined,
    {  }
  );

  // Mutations
  const utils = trpc.useUtils();
  const createMutation = trpc.challenges.create.useMutation({
    onSuccess: () => {
      utils.challenges.list.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Challenge created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const joinMutation = trpc.challenges.join.useMutation({
    onSuccess: () => {
      utils.challenges.list.invalidate();
      toast.success("Joined challenge");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.challenges.deleteChallenge.useMutation({
    onSuccess: () => {
      utils.challenges.list.invalidate();
      toast.success("Challenge deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsPrivate(true);
  };

  const handleCreate = () => {
    if (!name || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      name,
      description,
      challengeType: "daily_consistency",
      startDate,
      endDate,
      isPrivate,
    });
  };

  if (challengesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Challenges" subtitle="Group challenges & competitions" showBack />

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Challenges You Created */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Challenges</h2>
          {challenges?.created && challenges.created.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.created.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {challenge.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this challenge? This cannot be undone.")) {
                              deleteMutation.mutate({ id: challenge.id });
                            }
                          }}
                          className="text-muted-foreground/40 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(challenge.startDate).toLocaleDateString()} -{" "}
                        {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Private challenge</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{challenge.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't created any challenges yet
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Challenge
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Challenges You Joined */}
        <div>
          <h2 className="text-xl font-bold mb-4">Joined Challenges</h2>
          {challenges?.joined && challenges.joined.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.joined.map((participation) => (
                <Card key={participation.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Challenge #{participation.sessionId}</CardTitle>
                    <CardDescription className="text-xs">
                      Status: {participation.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Joined: {new Date(participation.joinedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You haven't joined any challenges yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">How Group Challenges Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <p>
                <strong>Create or join:</strong> Set up a challenge with specific start/end dates,
                or join one created by your Inner Circle.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <p>
                <strong>Daily practice:</strong> Complete your daily will cycles during the
                challenge period to track progress.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <p>
                <strong>Collective accountability:</strong> See group progress without exposing
                individual content—mechanical observation, not social comparison.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
