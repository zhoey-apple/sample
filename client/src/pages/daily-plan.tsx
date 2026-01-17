import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { usePlans } from "@/hooks/use-plans";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function DailyPlanPage() {
  const [match, params] = useRoute("/day/:date");
  const dateStr = params?.date || format(new Date(), "yyyy-MM-dd");
  const { getPlan, updatePlan } = usePlans();
  const { data: plan, isLoading } = getPlan(dateStr, 'day');

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
  const prevDate = format(subDays(dateObj, 1), "yyyy-MM-dd");
  const nextDate = format(addDays(dateObj, 1), "yyyy-MM-dd");

  const handleTaskToggle = (taskId: string, isUnfinished: boolean) => {
    const listKey = isUnfinished ? 'unfinishedTasks' : 'tasks';
    const list = [...(plan[listKey] || [])];
    const taskIndex = list.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    list[taskIndex] = { ...list[taskIndex], completed: !list[taskIndex].completed };
    
    updatePlan.mutate({
      planId: plan.id,
      updates: { [listKey]: list }
    });
  };

  const handleAddTask = (text: string) => {
    const newTask = { id: Math.random().toString(36).substr(2, 9), text, completed: false };
    updatePlan.mutate({
      planId: plan.id,
      updates: { tasks: [...plan.tasks, newTask] }
    });
  };

  const handleUpdateNotes = (notes: string) => {
    updatePlan.mutate({
      planId: plan.id,
      updates: { notes }
    });
  };

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        
        {/* HEADER & CONTINUITY */}
        <header className="flex items-center justify-between">
          <Link href={`/day/${prevDate}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <ChevronLeft className="w-6 h-6" />
            </a>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-1">
              {format(dateObj, "MMMM d")}
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
              {format(dateObj, "EEEE, yyyy")}
            </p>
          </div>

          <Link href={`/day/${nextDate}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <ChevronRight className="w-6 h-6" />
            </a>
          </Link>
        </header>

        {/* DIRECTION (Collapsed for now as per minimal viable requirement, but placeholder) */}
        <section className="bg-muted/30 border border-border/50 rounded-lg p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Direction & Context
          </h2>
          <div className="text-sm text-muted-foreground italic">
            Focus: Monthly plan reference (To be implemented in Step 2)
          </div>
        </section>

        {/* TASK FLOW */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl font-medium border-b border-border pb-2">
            Task Flow
          </h2>

          {/* Unfinished from Yesterday */}
          {plan.unfinishedTasks && plan.unfinishedTasks.length > 0 && (
            <div className="space-y-3 bg-orange-50/50 dark:bg-orange-950/10 p-4 rounded-md border border-orange-100 dark:border-orange-900/20">
              <h3 className="text-xs font-bold uppercase text-orange-600/70 tracking-wide mb-2">
                Carried Over
              </h3>
              {plan.unfinishedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <button 
                    onClick={() => handleTaskToggle(task.id, true)}
                    className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <span className={`text-lg transition-all ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Today's Tasks */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide mb-2">
                Today
              </h3>
            {plan.tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 group">
                <button 
                  onClick={() => handleTaskToggle(task.id, false)}
                  className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  {task.completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-lg transition-all ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {task.text}
                </span>
              </div>
            ))}
            
            {/* New Task Input */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full" />
              </div>
              <Input 
                className="border-none shadow-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/50 p-0 h-auto font-normal"
                placeholder="Add a new task..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* IDEAS / NOTES */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-medium border-b border-border pb-2">
            Ideas & Notes
          </h2>
          <Textarea 
            value={plan.notes || ''}
            onChange={(e) => handleUpdateNotes(e.target.value)}
            className="min-h-[200px] border-none focus-visible:ring-0 bg-transparent text-lg leading-relaxed font-serif resize-none p-0"
            placeholder="Capture your thoughts, ideas, and observations..."
          />
        </section>
        
        {/* HABITS (MVP Lite) */}
         <section className="space-y-4 pt-8">
          <div className="flex items-center gap-8 p-4 bg-muted/20 rounded-lg">
             <span className="font-serif font-medium text-lg">Daily Habits</span>
             <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={plan.habits?.habit1 || false}
                    onCheckedChange={(c) => updatePlan.mutate({ 
                      planId: plan.id, 
                      updates: { habits: { ...plan.habits, habit1: !!c } } 
                    })}
                  />
                  <span className="text-sm">Exercise</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={plan.habits?.habit2 || false}
                    onCheckedChange={(c) => updatePlan.mutate({ 
                      planId: plan.id, 
                      updates: { habits: { ...plan.habits, habit2: !!c } } 
                    })}
                  />
                  <span className="text-sm">Read</span>
                </label>
             </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
