import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { format, getISOWeek, startOfISOWeek, getYear, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Book, LogOut, ChevronRight, ChevronDown, Folder, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    yearly: true,
    monthly: true,
    weekly: true,
    daily: true
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['plans', user?.id],
    queryFn: () => user ? storage.getAllPlans(user.id) : [],
    enabled: !!user
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    setLocation(`/day/${dateStr}`);
  };

  const pathParts = location.split('/');
  const currentDate = pathParts[1] === 'day' && pathParts[2] ? parseISO(pathParts[2]) : new Date();

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const executeCommand = (type: 'year' | 'month' | 'week' | 'day') => {
    const now = new Date();
    let dateStr = "";
    if (type === 'year') dateStr = format(now, "yyyy-01-01");
    else if (type === 'month') dateStr = format(now, "yyyy-MM-01");
    else if (type === 'week') dateStr = format(startOfISOWeek(now), "yyyy-MM-dd");
    else dateStr = format(now, "yyyy-MM-dd");
    
    setLocation(`/${type}/${dateStr}`);
    setOpen(false);
  };

  // Group plans for sidebar
  const groupedPlans = {
    yearly: plans.filter(p => p.type === 'year').sort((a,b) => b.date.localeCompare(a.date)),
    monthly: plans.filter(p => p.type === 'month').sort((a,b) => b.date.localeCompare(a.date)),
    weekly: plans.filter(p => p.type === 'week').sort((a,b) => b.date.localeCompare(a.date)),
    daily: plans.filter(p => p.type === 'day').sort((a,b) => b.date.localeCompare(a.date))
  };

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border bg-card flex flex-col h-screen sticky top-0">
        <div className="p-6 flex-shrink-0">
          <h1 className="font-serif text-2xl font-bold tracking-tight mb-2 text-primary">
            Life Principles
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
            Structured Diary
          </p>

          <nav className="space-y-4 mb-8">
            <Link href="/principles">
              <a className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                location === "/principles" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                <Book className="w-4 h-4" />
                <span>Life Principles</span>
              </a>
            </Link>
            <button 
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
                <div className="flex items-center gap-3">
                    <Search className="w-4 h-4" />
                    <span>Search Commands</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>P
                </kbd>
            </button>
          </nav>

          <div className="mb-8">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
              Calendar
            </div>
            <div className="bg-background rounded-lg border border-border p-2 shadow-sm relative">
              <DayPicker
                mode="single"
                showWeekNumber
                selected={currentDate}
                onSelect={(day) => day && handleDayClick(day)}
                classNames={{
                  root: "w-full",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium font-serif",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  week_number: "text-muted-foreground/40 text-[10px] w-9 flex items-center justify-center font-mono",
                }}
              />
            </div>
          </div>
        </div>

        {/* Plan File Tree */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
              Plans
            </div>
            {(['yearly', 'monthly', 'weekly', 'daily'] as const).map(type => (
                <div key={type} className="space-y-1">
                    <button 
                        onClick={() => toggleExpand(type)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {expanded[type] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <Folder className="w-4 h-4 text-primary/60" />
                        <span className="capitalize">{type}</span>
                    </button>
                    {expanded[type] && (
                        <div className="ml-7 space-y-1 border-l border-border/50 pl-2">
                            {groupedPlans[type].map(plan => (
                                <Link key={plan.id} href={`/${plan.type}/${plan.date}`}>
                                    <a className={cn(
                                        "flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-colors",
                                        location === `/${plan.type}/${plan.date}` 
                                            ? "bg-primary/5 text-primary font-medium" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    )}>
                                        <FileText className="w-3 h-3 opacity-50" />
                                        <span>{plan.type === 'day' ? format(parseISO(plan.date), "MMM d, yyyy") : plan.date}</span>
                                    </a>
                                </Link>
                            ))}
                            {groupedPlans[type].length === 0 && (
                                <div className="px-3 py-1 text-[10px] text-muted-foreground italic opacity-50">
                                    No {type} plans yet
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>

        <div className="mt-auto p-6 border-t border-border flex-shrink-0">
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto py-12 px-8 min-h-screen">
          {children}
        </div>
      </main>

      {/* Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => executeCommand('year')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create / Open Year Plan</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand('month')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create / Open Month Plan</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand('week')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create / Open Week Plan</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand('day')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create / Open Day Plan</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
