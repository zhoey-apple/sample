import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlans } from "@/hooks/use-plans";
import { useLocation } from "wouter";
import { format, startOfISOWeek, startOfMonth, startOfYear } from "date-fns";
import { CheckCircle2, Circle, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function OnboardingGuide() {
  const [open, setOpen] = useState(false);
  const { principles, getAllPlans } = usePlans();
  const { data: plans } = getAllPlans();
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const { t } = useI18n();

  // Check if first time user
  useEffect(() => {
     // Wait for data to load
     if (plans && principles !== undefined) {
         const hasCompletedOnboarding = localStorage.getItem("has-completed-onboarding");
         const hasTheme = localStorage.getItem("diary-theme");
         
         if (hasCompletedOnboarding === "true") return;
         
         // Don't show guide if theme hasn't been selected yet (let CoverSelection handle that first)
         if (!hasTheme) return;

         const hasYearPlan = plans.some(p => p.type === 'year');
         const hasPrinciples = principles?.content && principles.content.length > 50; 

         // If truly empty (no year plan, no substantial principles), show guide
         if (!hasYearPlan && !hasPrinciples) {
             setOpen(true);
         }
     }
  }, [plans, principles]);

  // Listen for manual open event and theme selection
  useEffect(() => {
    const handleCheck = () => {
        // Same logic as above, triggered after theme selection
        const hasCompletedOnboarding = localStorage.getItem("has-completed-onboarding");
        if (hasCompletedOnboarding === "true") return;
        
        if (plans) {
             const hasYearPlan = plans.some(p => p.type === 'year');
             const hasPrinciples = principles?.content && principles.content.length > 50; 
             if (!hasYearPlan && !hasPrinciples) {
                 setOpen(true);
             }
        }
    };

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
    window.addEventListener("check-onboarding", handleCheck);
    
    return () => {
        window.removeEventListener("open-onboarding", handleManualOpen);
        window.removeEventListener("check-onboarding", handleCheck);
    };
  }, [plans, principles]);

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
        title: t("step_foundation"),
        description: t("step_foundation_desc"),
        action: t("step_foundation_action"),
        doAction: () => {
            setLocation("/principles");
            setOpen(false);
        }
    },
    {
        id: 2,
        title: t("step_monthly"),
        description: t("step_monthly_desc"),
        action: t("step_monthly_action"),
        doAction: () => createPlan('month', monthDate)
    },
    {
        id: 3,
        title: t("step_weekly"),
        description: t("step_weekly_desc"),
        action: t("step_weekly_action"),
        doAction: () => createPlan('week', weekDate)
    },
    {
        id: 4,
        title: t("step_daily"),
        description: t("step_daily_desc"),
        action: t("step_daily_action"),
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
                    <DialogTitle className="text-2xl font-serif">{t("welcome_title")}</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        {t("welcome_desc")}
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
                    {t("dont_show_again")}
                </Button>
                <div className="flex gap-2">
                    {step > 1 && (
                        <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>
                            {t("back")}
                        </Button>
                    )}
                    {step < 4 ? (
                        <Button variant="ghost" size="sm" onClick={() => setStep(s => s + 1)}>
                            {t("next_step")}
                        </Button>
                    ) : (
                        <Button size="sm" onClick={handleComplete}>
                            {t("finish_guide")}
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
