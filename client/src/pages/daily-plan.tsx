import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { usePlans } from "@/hooks/use-plans";
import { Layout } from "@/components/layout";
import { format, parseISO, addDays, subDays, startOfISOWeek, endOfISOWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { PlanType } from "@/lib/types";

export default function DailyPlanPage() {
  const [matchDay, paramsDay] = useRoute("/day/:date");
  const [matchWeek, paramsWeek] = useRoute("/week/:date");
  const [matchMonth, paramsMonth] = useRoute("/month/:date");
  const [matchYear, paramsYear] = useRoute("/year/:date");

  let type: PlanType = 'day';
  let dateStr = "";

  if (matchDay) { type = 'day'; dateStr = paramsDay.date; }
  else if (matchWeek) { type = 'week'; dateStr = paramsWeek.date; }
  else if (matchMonth) { type = 'month'; dateStr = paramsMonth.date; }
  else if (matchYear) { type = 'year'; dateStr = paramsYear.date; }
  else dateStr = format(new Date(), "yyyy-MM-dd");

  const { getPlan, updatePlan } = usePlans();
  const { data: plan, isLoading } = getPlan(dateStr, type);

  if (isLoading || !plan) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const dateObj = parseISO(dateStr);
  let prevDate = "";
  let nextDate = "";
  let title = "";
  let subtitle = "";

  if (type === 'day') {
    prevDate = format(subDays(dateObj, 1), "yyyy-MM-dd");
    nextDate = format(addDays(dateObj, 1), "yyyy-MM-dd");
    title = format(dateObj, "MMMM d");
    subtitle = format(dateObj, "EEEE, yyyy");
  } else if (type === 'week') {
    prevDate = format(subDays(dateObj, 7), "yyyy-MM-dd");
    nextDate = format(addDays(dateObj, 7), "yyyy-MM-dd");
    title = `Week ${format(dateObj, "w")}`;
    subtitle = `${format(startOfISOWeek(dateObj), "MMM d")} - ${format(endOfISOWeek(dateObj), "MMM d, yyyy")}`;
  } else if (type === 'month') {
    prevDate = format(subDays(startOfMonth(dateObj), 1), "yyyy-MM-01");
    nextDate = format(addDays(endOfMonth(dateObj), 1), "yyyy-MM-01");
    title = format(dateObj, "MMMM");
    subtitle = format(dateObj, "yyyy");
  } else if (type === 'year') {
    prevDate = format(subDays(startOfYear(dateObj), 1), "yyyy-01-01");
    nextDate = format(addDays(endOfYear(dateObj), 1), "yyyy-01-01");
    title = format(dateObj, "yyyy");
    subtitle = "Annual Principles & Goals";
  }

  const handleTaskToggle = (taskId: string, isUnfinished: boolean) => {
    const listKey = isUnfinished ? 'unfinishedTasks' : 'tasks';
    const list = [...(plan[listKey] || [])];
    const taskIndex = list.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    list[taskIndex] = { ...list[taskIndex], completed: !list[taskIndex].completed };
    updatePlan.mutate({ planId: plan.id, updates: { [listKey]: list } });
  };

  const handleAddTask = (text: string) => {
    const newTask = { id: Math.random().toString(36).substr(2, 9), text, completed: false };
    updatePlan.mutate({ planId: plan.id, updates: { tasks: [...plan.tasks, newTask] } });
  };

  const handleUpdateNotes = (notes: string) => {
    updatePlan.mutate({ planId: plan.id, updates: { notes } });
  };

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        <header className="flex items-center justify-between">
          <Link href={`/${type}/${prevDate}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <ChevronLeft className="w-6 h-6" />
            </a>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-1">{title}</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">{subtitle}</p>
          </div>
          <Link href={`/${type}/${nextDate}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <ChevronRight className="w-6 h-6" />
            </a>
          </Link>
        </header>

        <section className="bg-muted/30 border border-border/50 rounded-lg p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Direction & Context</h2>
          <div className="text-sm text-muted-foreground italic">
            Inheriting values from Principles document and upper level plans...
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-medium border-b border-border pb-2">Task Flow</h2>
          {plan.unfinishedTasks && plan.unfinishedTasks.length > 0 && (
            <div className="space-y-3 bg-orange-50/50 dark:bg-orange-950/10 p-4 rounded-md border border-orange-100 dark:border-orange-900/20">
              <h3 className="text-xs font-bold uppercase text-orange-600/70 tracking-wide mb-2">Carried Over</h3>
              {plan.unfinishedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <button onClick={() => handleTaskToggle(task.id, true)} className="mt-1 text-muted-foreground hover:text-primary transition-colors">
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <span className={`text-lg transition-all ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.text}</span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide mb-2">Current</h3>
            {plan.tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 group">
                <button onClick={() => handleTaskToggle(task.id, false)} className="mt-1 text-muted-foreground hover:text-primary transition-colors">
                  {task.completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-lg transition-all ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-5 h-5 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" /></div>
              <Input className="border-none shadow-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/50 p-0 h-auto font-normal" placeholder="Add a new task..." onKeyDown={(e) => { if (e.key === 'Enter') { handleAddTask(e.currentTarget.value); e.currentTarget.value = ''; } }} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-medium border-b border-border pb-2">Ideas & Notes</h2>
          <Textarea value={plan.notes || ''} onChange={(e) => handleUpdateNotes(e.target.value)} className="min-h-[200px] border-none focus-visible:ring-0 bg-transparent text-lg leading-relaxed font-serif resize-none p-0" placeholder="Capture your thoughts, ideas, and observations..." />
        </section>
        
        {type === 'day' && (
         <section className="space-y-4 pt-8">
          <div className="flex items-center gap-8 p-4 bg-muted/20 rounded-lg">
             <span className="font-serif font-medium text-lg">Daily Habits</span>
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={plan.habits?.habit1 || false} onCheckedChange={(c) => updatePlan.mutate({ planId: plan.id, updates: { habits: { ...plan.habits, habit1: !!c } } })} />
                  <span className="text-sm">Exercise</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={plan.habits?.habit2 || false} onCheckedChange={(c) => updatePlan.mutate({ planId: plan.id, updates: { habits: { ...plan.habits, habit2: !!c } } })} />
                  <span className="text-sm">Read</span>
                </label>
             </div>
          </div>
        </section>
        )}
      </div>
    </Layout>
  );
}
