import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Router } from "wouter";
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
import { CookieConsent } from "./components/CookieConsent";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminAudiobookTools from "./pages/admin/AdminAudiobookTools";
import AdminActivityLog from "./pages/admin/AdminActivityLog";

/**
 * Public routes — accessible without authentication.
 * Landing page at /, plus terms, privacy, philosophy, and auth redirect.
 */
function PublicRouter() {
  const [location] = useLocation();

  return (
    <AnimatedRoutes>
      <Switch key={location}>
        <Route path="/" component={LandingPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/philosophy" component={Philosophy} />
        <Route path="/about" component={Philosophy} />
        <Route path="/404" component={NotFound} />
      </Switch>
    </AnimatedRoutes>
  );
}

/**
 * Authenticated app routes — all app features behind /app/*.
 * Uses wouter's nested Router with base="/app" so all child routes
 * are relative (e.g., "/" = /app, "/book" = /app/book).
 */
function AppRouter() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Show auth page if not authenticated
  if (!isLoading && !isAuthenticated) {
    // If on /app/auth, show auth page; otherwise redirect to auth
    if (location === "/auth" || location.startsWith("/auth?")) {
      return <AuthPage />;
    }
    // Redirect to auth page within app
    return <AuthPage />;
  }

  if (isLoading) {
    return null; // SplashScreen covers this
  }

  return (
    <AppShell>
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
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/subscriptions" component={AdminSubscriptions} />
          <Route path="/admin/feedback" component={AdminFeedback} />
          <Route path="/admin/audiobook-tools" component={AdminAudiobookTools} />
          <Route path="/admin/activity-log" component={AdminActivityLog} />
          <Route path="/auth" component={NewHome} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </AnimatedRoutes>
    </AppShell>
  );
}

/**
 * Root router — decides between public pages and the app.
 * - `/` and other public paths → PublicRouter
 * - `/app/*` → AppRouter (nested with base="/app")
 */
function RootRouter() {
  const [location] = useLocation();

  // Check if we're on an /app path
  const isAppPath = location === "/app" || location.startsWith("/app/") || location.startsWith("/app?");

  if (isAppPath) {
    return (
      <Router base="/app">
        <AppRouter />
      </Router>
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
          <CookieConsent />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
