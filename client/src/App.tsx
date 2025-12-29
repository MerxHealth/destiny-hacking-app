import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import WeeklyReview from "./pages/WeeklyReview";
import PrayerJournal from "./pages/PrayerJournal";
import { OfflineIndicator } from "./components/OfflineIndicator";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={NewHome} />
      <Route path={" /old-home"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/sliders"} component={Sliders} />
      <Route path={"/daily-cycle"} component={DailyCycle} />
      <Route path={"/insights"} component={Insights} />
      <Route path={"/inner-circle"} component={InnerCircle} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/challenges"} component={Challenges} />
      <Route path={"/modules"} component={Modules} />
      <Route path={"/sowing-reaping"} component={SowingReaping} />
      <Route path={"/profiles"} component={Profiles} />
      <Route path={" /weekly-review"} component={WeeklyReview} />
      <Route path={"/prayer-journal"} component={PrayerJournal} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <OfflineIndicator />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
