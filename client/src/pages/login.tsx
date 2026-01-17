import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50 bg-white/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-serif text-2xl font-bold">L</span>
          </div>
          <CardTitle className="font-serif text-3xl font-medium">Life Principles Diary</CardTitle>
          <CardDescription className="text-base">
            A structured system for continuity and growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg bg-background/50 border-muted focus:border-primary font-serif"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              Enter Diary
            </Button>
            
            <p className="text-xs text-center text-muted-foreground pt-4">
              Simple email login. No password required for this MVP.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
