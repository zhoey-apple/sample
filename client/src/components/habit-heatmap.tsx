import { Principles, Plan } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, eachDayOfInterval, subYears, isSameDay, parseISO } from "date-fns";
import { Info } from "lucide-react";

interface HabitHeatmapProps {
  principles: Principles;
  plans: Plan[];
}

export function HabitHeatmap({ principles, plans }: HabitHeatmapProps) {
  const habits = principles.habitDefinitions || [];
  
  if (habits.length === 0) return null;

  // Generate last 365 days
  const today = new Date();
  const oneYearAgo = subYears(today, 1);
  const days = eachDayOfInterval({ start: oneYearAgo, end: today });

  // Map plans by date for O(1) lookup
  const plansByDate = plans.reduce((acc, plan) => {
    if (plan.type === 'day') {
      acc[plan.date] = plan;
    }
    return acc;
  }, {} as Record<string, Plan>);

  return (
    <div className="space-y-6 mt-8 border-t border-border pt-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-serif font-bold text-sm uppercase tracking-widest text-muted-foreground">Habit Consistency</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-muted-foreground/50" />
            </TooltipTrigger>
            <TooltipContent>
              <p>One square = one day. Darker = completed.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {habits.map(habit => (
        <div key={habit.id} className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
             <span>{habit.text}</span>
          </div>
          <div className="flex flex-wrap gap-[2px]">
            {days.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const plan = plansByDate[dateStr];
              const isCompleted = plan?.habits?.[habit.id];
              
              return (
                <div
                  key={dateStr}
                  className={cn(
                    "w-2.5 h-2.5 rounded-[1px] transition-colors",
                    isCompleted 
                      ? "bg-primary" 
                      : "bg-muted/30"
                  )}
                  title={`${dateStr}: ${isCompleted ? 'Completed' : 'Missed'}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
