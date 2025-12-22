import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Gauge, Calendar, Users, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5" />
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              A Digital User's Manual for{" "}
              <span className="text-primary">Human Agency</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Destiny Hacking is not therapy. It's not a diary. It's a control panel for conscious will—calibrate your emotional state, track cause-effect relationships, and operationalize free will.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/dashboard">
                  Start Calibrating <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link href="/about">
                  Learn the Philosophy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Four Tools for Conscious Will
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Not motivation. Not inspiration. Just mechanical precision for human agency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1: Emotional Sliders */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Emotional Sliders</h3>
              <p className="text-muted-foreground leading-relaxed">
                Calibrate your emotional state on bipolar axes (Fear ← → Courage). 
                This is not journaling—it's measurement. Emotions are variables, not identities. 
                Track them like you'd track fuel levels.
              </p>
            </Card>

            {/* Feature 2: Daily Will Cycle */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Daily Will Cycle</h3>
              <p className="text-muted-foreground leading-relaxed">
                Morning: Calibrate state. Midday: One decisive action. Evening: Map cause-effect. 
                This is a command interface, not a diary. Pilot, not passenger.
              </p>
            </Card>

            {/* Feature 3: AI Coach (Stoic Strategist) */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">AI Coach</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pattern analysis and decisive prompts from a Stoic strategist. 
                No therapy language. No motivational clichés. Just: "Your courage dropped 30 points. What action reclaims that ground?"
              </p>
            </Card>

            {/* Feature 4: Inner Circle */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-chart-1" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Inner Circle</h3>
              <p className="text-muted-foreground leading-relaxed">
                Invite-only accountability. Share states (not content). No likes, no comments, no feeds. 
                Just mutual visibility for collective practice.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-8">
              The Philosophy
            </h2>
            
            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                <strong className="text-foreground">Free will is not a belief—it's a practice.</strong> 
                Destiny Hacking operationalizes the Stoic principle that you control your responses, 
                not your circumstances. This app is built on one core idea: 
                <em className="text-foreground"> emotions are data, decisions are code, and you are the programmer.</em>
              </p>
              
              <p className="text-lg leading-relaxed">
                Most self-help treats you as broken. Therapy treats you as a patient. 
                Social media treats you as content. Destiny Hacking treats you as a <strong className="text-foreground">pilot</strong>—conscious, 
                capable, and responsible for the trajectory of your life.
              </p>
              
              <p className="text-lg leading-relaxed">
                This is not about "feeling better." It's about <strong className="text-foreground">seeing clearly</strong>. 
                When you calibrate your emotional state daily, you stop being surprised by your reactions. 
                When you map cause-effect relationships, you stop blaming circumstances. 
                When you commit to one decisive action per day, you stop waiting for motivation.
              </p>
            </div>

            <div className="text-center pt-8">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Begin Your Practice <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Destiny Hacking. A digital user's manual for human agency.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/philosophy" className="text-muted-foreground hover:text-foreground transition-colors">
                Philosophy
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
