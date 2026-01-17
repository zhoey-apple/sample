import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DailyPlanPage from "@/pages/daily-plan";
import PrinciplesPage from "@/pages/principles";
import { format } from "date-fns";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/principles">
        {() => <ProtectedRoute component={PrinciplesPage} />}
      </Route>
      
      <Route path="/day/:date">
        {() => <ProtectedRoute component={DailyPlanPage} />}
      </Route>
      
      {/* Root redirects to today's daily plan */}
      <Route path="/">
         {() => <Redirect to={`/day/${today}`} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
