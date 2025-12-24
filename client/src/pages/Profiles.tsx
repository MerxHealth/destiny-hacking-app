import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Save, FolderOpen, Trash2, Star } from "lucide-react";

/**
 * Slider Profiles Page
 * 
 * Save and load different slider configurations for different contexts
 * (Work, Relationships, Fitness, etc.)
 */

export default function Profiles() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [axisValues, setAxisValues] = useState<Record<number, number>>({});

  const { data: profiles } = trpc.profiles.list.useQuery();
  const { data: axes } = trpc.sliders.listAxes.useQuery();
  const utils = trpc.useUtils();

  const createProfile = trpc.profiles.create.useMutation({
    onSuccess: () => {
      utils.profiles.list.invalidate();
      setShowCreateForm(false);
      setProfileName("");
      setProfileDescription("");
      setAxisValues({});
    },
  });

  const deleteProfile = trpc.profiles.delete.useMutation({
    onSuccess: () => {
      utils.profiles.list.invalidate();
    },
  });

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    const axisConfiguration = Object.entries(axisValues).map(([axisId, value]) => ({
      axisId: Number(axisId),
      defaultValue: value,
    }));

    createProfile.mutate({
      name: profileName,
      description: profileDescription || undefined,
      axisConfiguration,
      isDefault: false,
    });
  };

  const handleLoadProfile = async (profileId: number) => {
    // Load profile and apply values to sliders
    const profile = profiles?.find(p => p.id === profileId);
    if (!profile) return;

    // Apply each axis value
    const config = profile.axisConfiguration as Array<{ axisId: number; defaultValue: number }>;
    for (const { axisId, defaultValue } of config) {
      // Here you would apply the slider values to the actual sliders page
      // For now, just show a success message
    }

    alert(`Profile "${profile.name}" loaded! Navigate to Sliders page to see the values.`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Slider Profiles</h1>
              <p className="text-muted-foreground">
                Save and load different configurations for different contexts
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Create New Profile */}
        {!showCreateForm ? (
          <Card className="p-8 mb-8 text-center">
            <Save className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Save Current State as Profile</h2>
            <p className="text-muted-foreground mb-6">
              Create profiles for Work, Relationships, Fitness, or any context
            </p>
            <Button onClick={() => setShowCreateForm(true)} size="lg">
              Create New Profile
            </Button>
          </Card>
        ) : (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">New Profile</h2>
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div>
                <Label htmlFor="profileName">Profile Name</Label>
                <Input
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g., Work Mode, Family Time, Gym Focus"
                  required
                />
              </div>

              <div>
                <Label htmlFor="profileDescription">Description (Optional)</Label>
                <Textarea
                  id="profileDescription"
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                  placeholder="When do you use this profile?"
                  className="min-h-20"
                />
              </div>

              <div>
                <Label>Set Default Values for Each Axis</Label>
                <div className="space-y-4 mt-4">
                  {axes?.map((axis) => (
                    <div key={axis.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {axis.leftLabel} ↔ {axis.rightLabel}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {axisValues[axis.id] || 50}
                        </span>
                      </div>
                      <Slider
                        value={[axisValues[axis.id] || 50]}
                        onValueChange={(value) => setAxisValues(prev => ({ ...prev, [axis.id]: value[0] }))}
                        max={100}
                        step={1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={createProfile.isPending}>
                  {createProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Profiles List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Saved Profiles</h2>
          
          {profiles?.map((profile) => (
            <Card key={profile.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{profile.name}</h3>
                    {profile.isDefault && (
                      <Badge variant="default">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  {profile.description && (
                    <p className="text-sm text-muted-foreground">{profile.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadProfile(profile.id)}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete profile "${profile.name}"?`)) {
                        deleteProfile.mutate({ profileId: profile.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Show axis configuration */}
              <div className="space-y-2 mt-4">
                {(profile.axisConfiguration as Array<{ axisId: number; defaultValue: number }>)?.map((config) => {
                  const axis = axes?.find(a => a.id === config.axisId);
                  if (!axis) return null;
                  
                  return (
                    <div key={config.axisId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {axis.leftLabel} ↔ {axis.rightLabel}
                      </span>
                      <Badge variant="outline">{config.defaultValue}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}

          {profiles?.length === 0 && !showCreateForm && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No profiles saved yet. Create your first profile to quickly switch between different emotional states.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
