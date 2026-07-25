import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import Setup from "./pages/Setup";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import Contact from "./pages/Contact";
import FirestickSetup from "./pages/seo/FirestickSetup";
import SmartTvSetup from "./pages/seo/SmartTvSetup";
import IphoneSetup from "./pages/seo/IphoneSetup";
import AndroidSetup from "./pages/seo/AndroidSetup";
import WebPlayerSetup from "./pages/seo/WebPlayerSetup";
import FixBuffering from "./pages/seo/FixBuffering";
import TrialRequest from "./pages/TrialRequest";
import HermesAdmin from "./pages/HermesAdmin";
import Affiliate from "./pages/Affiliate";
import { useReferralCapture } from "./hooks/useReferral";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/success"} component={Success} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/setup"} component={Setup} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/refund-policy"} component={RefundPolicy} />
      <Route path={"/contact"} component={Contact} />
      <Route path="/trial" component={TrialRequest} />
      <Route path="/affiliate" component={Affiliate} />
      <Route path="/admin/hermes" component={HermesAdmin} />
      {/* SEO landing pages */}
      <Route path={"/firestick-setup"} component={FirestickSetup} />
      <Route path={"/smart-tv-setup"} component={SmartTvSetup} />
      <Route path={"/iphone-ipad-setup"} component={IphoneSetup} />
      <Route path={"/android-setup"} component={AndroidSetup} />
      <Route path={"/web-player"} component={WebPlayerSetup} />
      <Route path={"/fix-buffering"} component={FixBuffering} />
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
  // Capture ?ref= from URL on any page and persist for 30 days
  useReferralCapture();

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
