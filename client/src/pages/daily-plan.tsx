import { useEffect, useState, useMemo } from "react";
import { useRoute } from "wouter";
import { usePlans } from "@/hooks/use-plans";
import { Layout } from "@/components/layout";
import { format, parseISO, addDays, subDays, startOfISOWeek, endOfISOWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Loader2, Plus, Info, Trash2, History, Shuffle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { PlanType, Plan } from "@/lib/types";
import { MarkdownEditor } from "@/components/markdown-editor";
import { HabitHeatmap } from "@/components/habit-heatmap";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const { getPlan, updatePlan, principles, updatePrinciples, getAllPlans } = usePlans();
  const { data: plan, isLoading } = getPlan(dateStr, type);
  const { data: allPlans } = getAllPlans();
  const [newHabitText, setNewHabitText] = useState("");
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);

  // Determine prev/next links and titles
  const dateObj = parseISO(dateStr);
  let prevDate = "", nextDate = "", title = "", subtitle = "";
  
  // Date Logic
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
    subtitle = "Annual Plan";
  }

  // Embedding / Reference Logic (Simulated for MVP)
  // We need to fetch "referenced" plans. 
  // Since we don't have complex relational queries, we use date logic.
  const parentPlan = useMemo(() => {
     if (!allPlans) return null;
     if (type === 'day') {
         // Parent is Month
         const monthDate = format(startOfMonth(dateObj), "yyyy-MM-01");
         return allPlans.find(p => p.type === 'month' && p.date === monthDate);
     }
     if (type === 'week') {
         // Parent is Month
         const monthDate = format(startOfMonth(dateObj), "yyyy-MM-01");
         return allPlans.find(p => p.type === 'month' && p.date === monthDate);
     }
     if (type === 'month') {
         // Parent is Year
         const yearDate = format(startOfYear(dateObj), "yyyy-01-01");
         return allPlans.find(p => p.type === 'year' && p.date === yearDate);
     }
     return null;
  }, [allPlans, type, dateObj]);

  const previousPlan = useMemo(() => {
     if (!allPlans) return null;
     // previous month/week logic...
     if (type === 'month') {
         const prev = format(subMonths(dateObj, 1), "yyyy-MM-01");
         return allPlans.find(p => p.type === 'month' && p.date === prev);
     }
     if (type === 'week') {
         const prev = format(subWeeks(dateObj, 1), "yyyy-MM-dd"); // Assuming standardized week dates
         return allPlans.find(p => p.type === 'week' && p.date === prev);
     }
     return null;
  }, [allPlans, type, dateObj]);


  const historyPlan = useMemo(() => {
     if (!allPlans || type !== 'day') return null;
     // Find plan from same day and month but different year
     const currentDayMonth = format(dateObj, "MM-dd");
     const currentYear = format(dateObj, "yyyy");
     
     const matches = allPlans.filter(p => {
         if (p.type !== 'day') return false;
         const pDate = parseISO(p.date);
         return format(pDate, "MM-dd") === currentDayMonth && format(pDate, "yyyy") !== currentYear;
     });
     
     if (matches.length === 0) return null;
     // Sort by year descending to show most recent
     return matches.sort((a,b) => b.date.localeCompare(a.date))[0];
  }, [allPlans, type, dateObj]);

  const randomPastPlan = useMemo(() => {
      if (!allPlans || type !== 'day') return null;
      // Filter for past days, excluding today and history plan
      const todayStr = format(new Date(), "yyyy-MM-dd");
      
      const candidates = allPlans.filter(p => {
          if (p.type !== 'day') return false;
          if (p.date >= todayStr) return false; // Must be past
          if (historyPlan && p.id === historyPlan.id) return false; // Exclude if shown in history
          return true;
      });

      if (candidates.length === 0) return null;
      // Simple random selection
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex];
  }, [allPlans, type, historyPlan]);


  if (isLoading || !plan || !principles) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Handlers
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

  const handleDeleteTask = (taskId: string, isUnfinished: boolean) => {
    const listKey = isUnfinished ? 'unfinishedTasks' : 'tasks';
    const list = [...(plan[listKey] || [])];
    const updatedList = list.filter(t => t.id !== taskId);
    updatePlan.mutate({ planId: plan.id, updates: { [listKey]: updatedList } });
  };

  const handleAddHabit = () => {
    if (!newHabitText.trim()) return;
    const newHabit = {
        id: Math.random().toString(36).substr(2, 9),
        text: newHabitText,
        createdAt: new Date().toISOString()
    };
    updatePrinciples.mutate({ 
        habitDefinitions: [...(principles.habitDefinitions || []), newHabit] 
    });
    setNewHabitText("");
    setHabitDialogOpen(false);
  };

  const handleToggleHabit = (habitId: string, checked: boolean) => {
      updatePlan.mutate({
          planId: plan.id,
          updates: { habits: { ...plan.habits, [habitId]: checked } }
      });
  };

  return (
    <Layout>
      <div className="space-y-12 pb-20 fade-in duration-500">
        
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-border/40 pb-6">
          <Link href={`/${type}/${prevDate}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </a>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-1 tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium opacity-70">{subtitle}</p>
          </div>
          <Link href={`/${type}/${nextDate}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-full">
              <ChevronRight className="w-5 h-5" />
            </a>
          </Link>
        </header>

        {/* EMBEDDED CONTEXT (Top Section) */}
        {/* For Daily: Show Month Context */}
        {type === 'day' && parentPlan && (
            <section className="bg-muted/20 border border-border/40 rounded-lg p-5 group transition-colors hover:bg-muted/30">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    Monthly Direction
                </h2>
                <div className="text-sm text-foreground/80 font-serif leading-relaxed line-clamp-3 opacity-80 italic">
                     <MarkdownEditor 
                        value={parentPlan.notes || ''} 
                        onChange={(val) => updatePlan.mutate({ planId: parentPlan.id, updates: { notes: val } })}
                        placeholder="Set monthly direction..."
                        className="min-h-[60px] text-sm italic opacity-80"
                    />
                </div>
                <Link href={`/month/${parentPlan.date}`}>
                    <a className="text-xs text-primary mt-2 inline-block hover:underline opacity-0 group-hover:opacity-100 transition-opacity">View Month Plan →</a>
                </Link>
            </section>
        )}

        {/* For Month: Show Year Context */}
        {type === 'month' && parentPlan && (
            <section className="bg-muted/20 border border-border/40 rounded-lg p-5 group transition-colors hover:bg-muted/30">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    Yearly Goals
                </h2>
                <div className="text-sm text-foreground/80 font-serif leading-relaxed line-clamp-3 opacity-80 italic">
                    <MarkdownEditor 
                        value={parentPlan.notes || ''} 
                        onChange={(val) => updatePlan.mutate({ planId: parentPlan.id, updates: { notes: val } })}
                        placeholder="Set yearly goals..."
                        className="min-h-[60px] text-sm italic opacity-80"
                    />
                </div>
            </section>
        )}

        {/* TASK FLOW (Core) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
             <h2 className="font-serif text-xl font-medium">Task Flow</h2>
             {plan.unfinishedTasks && plan.unfinishedTasks.filter(t => !t.completed).length > 0 && (
                 <span className="text-xs font-mono text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                     {plan.unfinishedTasks.filter(t => !t.completed).length} carried over
                 </span>
             )}
          </div>

          {/* Unfinished from Yesterday (Only show if there are any) */}
          {plan.unfinishedTasks && plan.unfinishedTasks.length > 0 && (
            <div className="space-y-2 pl-1">
              {plan.unfinishedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <button onClick={() => handleTaskToggle(task.id, true)} className="mt-1.5 text-orange-600/60 hover:text-orange-600 transition-colors">
                    {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <span className={cn(
                      "text-base transition-all font-serif flex-1",
                      task.completed ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground/90'
                  )}>{task.text}</span>
                  <button 
                    onClick={() => handleDeleteTask(task.id, true)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all p-1"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Today's Tasks */}
          <div className="space-y-2 pl-1">
            {plan.tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 group min-h-[28px]">
                <button onClick={() => handleTaskToggle(task.id, false)} className="mt-1.5 text-muted-foreground hover:text-primary transition-colors">
                  {task.completed ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                </button>
                <span className={cn(
                    "text-base transition-all font-serif flex-1",
                    task.completed ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'
                )}>{task.text}</span>
                <button 
                    onClick={() => handleDeleteTask(task.id, false)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all p-1"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            
            {/* Quick Add */}
            <div className="flex items-center gap-3 pt-1 group">
              <Plus className="w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary/50 transition-colors" />
              <Input 
                  className="border-none shadow-none focus-visible:ring-0 bg-transparent text-base placeholder:text-muted-foreground/40 p-0 h-auto font-sans" 
                  placeholder="New task..." 
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

        {/* EDITOR (Creative Thoughts / Notes) */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-medium border-b border-border/40 pb-2">
            {type === 'year' ? 'Goals & Vision' : type === 'month' ? 'Reflection & Initiatives' : 'Notes & Ideas'}
          </h2>
          <MarkdownEditor 
            value={plan.notes || ''} 
            onChange={(val) => handleUpdateNotes(val)} 
            placeholder="Start typing..."
          />
        </section>
        
        {/* HABIT TRACKER (Bottom Widget) */}
        {type === 'day' && (
         <section className="space-y-4 pt-4">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Habit Tracker</h2>
                    {(principles.habitDefinitions?.length || 0) < 2 && (
                         <Dialog open={habitDialogOpen} onOpenChange={setHabitDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="text-primary hover:bg-primary/10 rounded-full p-0.5 transition-colors">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Define a New Habit</DialogTitle>
                                    <DialogDescription>
                                        Add a habit to track daily. Max 2 habits allowed.
                                        <br/>
                                        <span className="text-destructive font-medium mt-1 block">Warning: Once defined, habits cannot be deleted in this MVP.</span>
                                    </DialogDescription>
                                </DialogHeader>
                                <Input 
                                    placeholder="e.g. Read 10 pages, Run 5k..." 
                                    value={newHabitText}
                                    onChange={(e) => setNewHabitText(e.target.value)}
                                />
                                <DialogFooter>
                                    <Button onClick={handleAddHabit}>Create Habit</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <span className="text-[10px] text-muted-foreground">{principles.habitDefinitions?.length || 0}/2 Habits</span>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {principles.habitDefinitions?.map(habit => (
                    <div key={habit.id} className="bg-card border border-border/50 rounded-lg p-3 flex items-center justify-between shadow-sm">
                        <span className="text-sm font-medium">{habit.text}</span>
                        <Checkbox 
                            checked={plan.habits?.[habit.id] || false}
                            onCheckedChange={(checked) => handleToggleHabit(habit.id, !!checked)}
                        />
                    </div>
                ))}
                {(principles.habitDefinitions?.length || 0) === 0 && (
                    <div className="col-span-2 text-center py-4 text-sm text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed border-border">
                        No habits defined yet. Click + to add one.
                    </div>
                )}
             </div>

             {/* Heatmap Widget */}
             {(principles.habitDefinitions?.length || 0) > 0 && (
                 <HabitHeatmap principles={principles} plans={allPlans || []} />
             )}

            {/* HISTORY SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/40 mt-8">
                {/* On This Day */}
                <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <History className="w-3 h-3" />
                        On This Day
                    </h3>
                    <div className="bg-muted/10 border border-border/40 rounded-lg p-4 min-h-[120px]">
                        {historyPlan ? (
                             <div className="space-y-2">
                                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                                    {format(parseISO(historyPlan.date), "yyyy")}
                                </div>
                                <MarkdownEditor 
                                    value={historyPlan.notes || "No notes recorded."} 
                                    readOnly={true}
                                    className="text-sm text-foreground/70 italic min-h-[60px]"
                                />
                             </div>
                        ) : (
                            <div className="text-sm text-muted-foreground/50 italic flex items-center justify-center h-full min-h-[80px]">
                                No history found for this date.
                            </div>
                        )}
                    </div>
                </div>

                {/* Random Past Day */}
                <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Shuffle className="w-3 h-3" />
                        Random Past Entry
                    </h3>
                    <div className="bg-muted/10 border border-border/40 rounded-lg p-4 min-h-[120px]">
                        {randomPastPlan ? (
                             <div className="space-y-2">
                                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                                    {format(parseISO(randomPastPlan.date), "MMMM d, yyyy")}
                                </div>
                                <MarkdownEditor 
                                    value={randomPastPlan.notes || "No notes recorded."} 
                                    readOnly={true}
                                    className="text-sm text-foreground/70 italic min-h-[60px]"
                                />
                             </div>
                        ) : (
                            <div className="text-sm text-muted-foreground/50 italic flex items-center justify-center h-full min-h-[80px]">
                                No past entries available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
        )}
      </div>
    </Layout>
  );
}
