import { AdminLayout } from "@/components/AdminLayout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  AudioLines,
  FileAudio,
  Layers,
  ExternalLink,
} from "lucide-react";

const tools = [
  {
    title: "Voice Cloning",
    description: "Manage ElevenLabs voice models for audiobook generation",
    icon: Mic,
    path: "/voice-cloning",
    color: "emerald",
  },
  {
    title: "Record Voice",
    description: "Record voice samples for cloning",
    icon: AudioLines,
    path: "/record-voice",
    color: "blue",
  },
  {
    title: "Generate Chapter",
    description: "Generate audio for a single chapter",
    icon: FileAudio,
    path: "/audiobook-generation",
    color: "purple",
  },
  {
    title: "Batch Generation",
    description: "Generate audio for all 14 chapters at once",
    icon: Layers,
    path: "/batch-audiobook-generation",
    color: "orange",
  },
];

const colorClasses: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export default function AdminAudiobookTools() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audiobook Tools</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Voice cloning and audiobook generation tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.path} href={tool.path}>
                <Card className="bg-card border-border hover:border-emerald-500/30 transition-colors cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${colorClasses[tool.color]}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-emerald-500 transition-colors flex items-center gap-2">
                          {tool.title}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Total Chapters</span>
              <span className="font-medium">14</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Languages</span>
              <span className="font-medium">EN, PT</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Audio Provider</span>
              <span className="font-medium">ElevenLabs</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">Cloudflare R2</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
