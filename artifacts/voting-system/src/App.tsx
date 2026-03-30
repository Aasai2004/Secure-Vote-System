import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/layout";
import Login from "@/pages/login";
import Vote from "@/pages/vote";
import Admin from "@/pages/admin";
import Results from "@/pages/results";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-serif font-bold text-primary">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The requested page does not exist or has been moved.
        </p>
        <div className="pt-4">
          <a href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/vote" component={Vote} />
        <Route path="/admin" component={Admin} />
        <Route path="/results" component={Results} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
