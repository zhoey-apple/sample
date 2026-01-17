import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlans } from "@/hooks/use-plans";
import { useLocation } from "wouter";
import { format, startOfISOWeek, startOfMonth, startOfYear } from "date-fns";
import { CheckCircle2, Circle, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const { principles, getAllPlans } = usePlans();
  const { data: plans } = getAllPlans();
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  // Check if first time user
  useEffect(() => {
     // Wait for data to load
     if (plans && principles !== undefined) {
         const hasCompletedOnboarding = localStorage.getItem("has-completed-onboarding");
         if (hasCompletedOnboarding === "true") return;

         const hasYearPlan = plans.some(p => p.type === 'year');
         const hasPrinciples = principles?.content && principles.content.length > 50; 

         // If truly empty (no year plan, no substantial principles), show guide
         if (!hasYearPlan && !hasPrinciples) {
             setOpen(true);
         }
     }
  }, [plans, principles]);

  // Listen for manual open event
  useEffect(() => {
    const handleManualOpen = () => {
        setOpen(true);
        // Determine sensible starting step based on existing data
        if (plans) {
            const hasYear = plans.some(p => p.type === 'year');
            const hasMonth = plans.some(p => p.type === 'month');
            const hasWeek = plans.some(p => p.type === 'week');
            
            if (!hasYear) setStep(1);
            else if (!hasMonth) setStep(2);
            else if (!hasWeek) setStep(3);
            else setStep(4);
        } else {
            setStep(1);
        }
    };
    window.addEventListener("open-onboarding", handleManualOpen);
    return () => window.removeEventListener("open-onboarding", handleManualOpen);
  }, [plans]);

  const handleComplete = () => {
      localStorage.setItem("has-completed-onboarding", "true");
      setOpen(false);
  };

  // Step Logic
  const today = new Date();
  const yearDate = format(startOfYear(today), "yyyy-01-01");
  const monthDate = format(startOfMonth(today), "yyyy-MM-01");
  const weekDate = format(startOfISOWeek(today), "yyyy-MM-dd");
  const dayDate = format(today, "yyyy-MM-dd");

  const createPlan = (type: 'year' | 'month' | 'week' | 'day', date: string) => {
      setLocation(`/${type}/${date}`);
      setOpen(false); 
      // Mark as completed if we reach the end? 
      // Usually users will manually complete, but let's leave it open or allow re-entry.
  };

  const steps = [
    {
        id: 1,
        title: "Foundation",
        description: "Start by defining your Core Principles and Yearly Goals. These guide everything else.",
        action: "Create Principles & Year Plan",
        doAction: () => {
            setLocation("/principles");
            setOpen(false);
        }
    },
    {
        id: 2,
        title: "Monthly Direction",
        description: "Break down your yearly goals into actionable monthly initiatives.",
        action: "Create Monthly Plan",
        doAction: () => createPlan('month', monthDate)
    },
    {
        id: 3,
        title: "Weekly Focus",
        description: "Plan your week to align with your monthly direction.",
        action: "Create Weekly Plan",
        doAction: () => createPlan('week', weekDate)
    },
    {
        id: 4,
        title: "Daily Execution",
        description: "Execute on your tasks day by day, guided by your higher-level plans.",
        action: "Create Daily Plan",
        doAction: () => createPlan('day', dayDate)
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) {
            // If closing without finishing, maybe we shouldn't mark as complete?
            // But for UX, let's allow closing. 
            setOpen(false);
        }
    }}>
        <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden">
            <div className="p-6 pb-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Welcome to your Life Diary</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        This system is designed to align your daily actions with your life principles and long-term goals.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-4 gap-2">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 relative">
                            {i > 0 && <div className={cn("absolute top-4 -left-[50%] w-full h-[2px]", step > i ? "bg-primary" : "bg-muted")} />}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10",
                                step > s.id ? "bg-primary text-primary-foreground" :
                                step === s.id ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                                "bg-muted text-muted-foreground"
                            )}>
                                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                            </div>
                            <span className={cn(
                                "text-[10px] uppercase font-bold transition-colors",
                                step === s.id ? "text-primary" : "text-muted-foreground"
                            )}>{s.title.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-muted/30 p-8 rounded-xl border border-border/50 text-center space-y-4">
                    <h3 className="text-xl font-medium font-serif">{currentStep.title}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">{currentStep.description}</p>
                    
                    <Button onClick={currentStep.doAction} className="w-full sm:w-auto min-w-[200px] mt-4" size="lg">
                        {currentStep.action} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            <DialogFooter className="bg-muted/10 p-4 px-6 flex justify-between items-center sm:justify-between border-t border-border/40">
                <Button variant="ghost" onClick={handleComplete} className="text-muted-foreground text-xs hover:text-foreground">
                    Don't show this again
                </Button>
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>
                            Back
                        </Button>
                    )}
                    {step < 4 ? (
                        <Button variant="ghost" size="sm" onClick={() => setStep(s => s + 1)}>
                            Next Step
                        </Button>
                    ) : (
                        <Button size="sm" onClick={handleComplete}>
                            Finish Guide
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
