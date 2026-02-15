import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppShell } from "./components/AppShell";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { SplashScreen } from "./components/SplashScreen";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Sliders from "./pages/Sliders";
import DailyCycle from "./pages/DailyCycle";
import Insights from "./pages/Insights";
import InnerCircle from "./pages/InnerCircle";
import Settings from "./pages/Settings";
import Challenges from "./pages/Challenges";
import Modules from "./pages/Modules";
import SowingReaping from "./pages/SowingReaping";
import Profiles from "./pages/Profiles";
import NewHome from "./pages/NewHome";
import More from "./pages/More";
import WeeklyReview from "./pages/WeeklyReview";
import PrayerJournal from "./pages/PrayerJournal";
import BiasClearing from "./pages/BiasClearing";
import ModuleDetail from "./pages/ModuleDetail";
import Achievements from "./pages/Achievements";
import { Audiobook } from "./pages/Audiobook";
import { Book } from "./pages/Book";
import { VoiceCloning } from "./pages/VoiceCloning";
import { AudiobookGeneration } from "./pages/AudiobookGeneration";
import { BatchAudiobookGeneration } from "./pages/BatchAudiobookGeneration";
import { RecordVoice } from "./pages/RecordVoice";
import { GenerateAudiobook } from "./pages/GenerateAudiobook";
import { ProgressDashboard } from "./pages/ProgressDashboard";
import { Flashcards } from "./pages/Flashcards";
import { OfflineIndicator } from "./components/OfflineIndicator";
import Philosophy from "./pages/Philosophy";
import MonthlyReportPage from "./pages/MonthlyReportPage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import { LanguageProvider } from "./contexts/LanguageContext";

/**
 * Public routes — accessible without authentication.
 * Landing page, auth, terms, privacy, philosophy.
 */
function PublicRouter() {
  const [location] = useLocation();

  return (
    <AnimatedRoutes>
      <Switch key={location}>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/philosophy" component={Philosophy} />
        <Route path="/about" component={Philosophy} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AnimatedRoutes>
  );
}

/**
 * Authenticated routes — all app features behind auth.
 */
function AuthenticatedRouter() {
  const [location] = useLocation();

  return (
    <AnimatedRoutes>
      <Switch key={location}>
        <Route path="/" component={NewHome} />
        <Route path="/old-home" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/sliders" component={Sliders} />
        <Route path="/daily-cycle" component={DailyCycle} />
        <Route path="/insights" component={Insights} />
        <Route path="/inner-circle" component={InnerCircle} />
        <Route path="/settings" component={Settings} />
        <Route path="/challenges" component={Challenges} />
        <Route path="/modules" component={Modules} />
        <Route path="/modules/:id" component={ModuleDetail} />
        <Route path="/sowing-reaping" component={SowingReaping} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/more" component={More} />
        <Route path="/weekly-review" component={WeeklyReview} />
        <Route path="/prayer-journal" component={PrayerJournal} />
        <Route path="/bias-clearing" component={BiasClearing} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/audiobook" component={Audiobook} />
        <Route path="/book" component={Book} />
        <Route path="/progress" component={ProgressDashboard} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/voice-cloning" component={VoiceCloning} />
        <Route path="/audiobook-generation" component={AudiobookGeneration} />
        <Route path="/batch-audiobook-generation" component={BatchAudiobookGeneration} />
        <Route path="/record-voice" component={RecordVoice} />
        <Route path="/generate-audiobook" component={GenerateAudiobook} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/philosophy" component={Philosophy} />
        <Route path="/about" component={Philosophy} />
        <Route path="/monthly-report" component={MonthlyReportPage} />
        <Route path="/auth" component={NewHome} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AnimatedRoutes>
  );
}

/**
 * Root router — decides between public and authenticated views.
 */
function RootRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show nothing while checking auth — SplashScreen covers this
    return null;
  }

  if (isAuthenticated) {
    return (
      <AppShell>
        <AuthenticatedRouter />
      </AppShell>
    );
  }

  return <PublicRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <TooltipProvider>
          <Toaster />
          <SplashScreen />
          <RootRouter />
          <OfflineIndicator />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
