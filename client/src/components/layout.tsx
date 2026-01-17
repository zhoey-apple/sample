import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { format, getISOWeek, startOfISOWeek, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Book, LogOut, ChevronRight, ChevronDown, Folder, FileText, Search, User, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  
  // Sidebar State - Initialize from localStorage
  const [isLeftOpen, setIsLeftOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-left");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  
  const [isRightOpen, setIsRightOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-right");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

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

  // Persist Sidebar State
  useEffect(() => {
    localStorage.setItem("sidebar-left", JSON.stringify(isLeftOpen));
  }, [isLeftOpen]);

  useEffect(() => {
    localStorage.setItem("sidebar-right", JSON.stringify(isRightOpen));
  }, [isRightOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Command Palette
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      
      // Sidebar Toggles (Shift + Ctrl + Arrow)
      if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setIsLeftOpen((prev: boolean) => !prev);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setIsRightOpen((prev: boolean) => !prev);
        }
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
  // Try to parse date from URL, fallback to today
  let currentDate = new Date();
  if (pathParts[1] && pathParts[2]) {
     try {
       currentDate = parseISO(pathParts[2]);
     } catch (e) {
       // ignore
     }
  }

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
    <div className="h-screen overflow-hidden bg-background flex font-sans text-foreground">
      
      {/* LEFT SIDEBAR: Navigation & Files */}
      <aside 
        className={cn(
          "border-r border-border bg-card/50 flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out relative",
          isLeftOpen ? "w-64" : "w-0 border-r-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="p-4 flex items-center gap-3 border-b border-border/40 h-14 min-w-64">
           <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold">L</div>
           <span className="font-serif font-semibold tracking-tight">Life Principles</span>
           <button 
             onClick={() => setIsLeftOpen(false)}
             className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent/50"
           >
             <PanelLeftClose className="w-4 h-4" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 min-w-64">
           {/* Global Actions */}
           <div className="px-2 space-y-1">
              <button 
                  onClick={() => setOpen(true)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all group"
              >
                  <Search className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  <span className="flex-1 text-left">Search</span>
                  <kbd className="text-[10px] bg-muted/50 px-1 rounded opacity-70">⌘P</kbd>
              </button>
              <Link href="/principles">
                <a className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors w-full group",
                  location === "/principles" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}>
                  <Book className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  <span>Principles</span>
                </a>
              </Link>
           </div>

           {/* Folder Tree */}
           <div className="space-y-1">
              {(['yearly', 'monthly', 'weekly', 'daily'] as const).map(type => (
                  <div key={type} className="space-y-1">
                      <button 
                          onClick={() => toggleExpand(type)}
                          className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      >
                          {expanded[type] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <span className="ml-1">{type}</span>
                      </button>
                      
                      {expanded[type] && (
                          <div className="ml-2 pl-2 border-l border-border/40 space-y-0.5">
                              {groupedPlans[type].map(plan => (
                                  <Link key={plan.id} href={`/${plan.type}/${plan.date}`}>
                                      <a className={cn(
                                          "flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors truncate",
                                          location === `/${plan.type}/${plan.date}` 
                                              ? "bg-accent text-accent-foreground font-medium" 
                                              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                                      )}>
                                          <FileText className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                                          <span className="truncate">
                                            {plan.type === 'day' ? format(parseISO(plan.date), "MMM d") : 
                                             plan.type === 'week' ? `Week ${format(parseISO(plan.date), "w")}` :
                                             plan.type === 'month' ? format(parseISO(plan.date), "MMMM") :
                                             plan.date.substring(0, 4)}
                                          </span>
                                      </a>
                                  </Link>
                              ))}
                              {groupedPlans[type].length === 0 && (
                                  <div className="px-2 py-1 text-xs text-muted-foreground/50 italic pl-6">Empty</div>
                              )}
                          </div>
                      )}
                  </div>
              ))}
           </div>
        </div>
        
        <div className="p-4 border-t border-border/40 flex items-center gap-3 min-w-64">
             <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
                <button onClick={logout} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Sign Out</button>
             </div>
        </div>
      </aside>

      {/* CENTER: Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-background relative flex flex-col items-center transition-all duration-300">
        
        {/* Collapse Toggles (Visible when sidebars closed) */}
        <div className="absolute top-4 left-4 z-10">
           {!isLeftOpen && (
             <button 
               onClick={() => setIsLeftOpen(true)}
               className="p-2 rounded-md bg-card/80 border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
               title="Expand Left Sidebar (Shift+Ctrl+Left)"
             >
               <PanelLeftOpen className="w-4 h-4" />
             </button>
           )}
        </div>
        <div className="absolute top-4 right-4 z-10">
           {!isRightOpen && (
             <button 
               onClick={() => setIsRightOpen(true)}
               className="p-2 rounded-md bg-card/80 border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
               title="Expand Right Sidebar (Shift+Ctrl+Right)"
             >
               <PanelRightOpen className="w-4 h-4" />
             </button>
           )}
        </div>

        <div className="w-full max-w-3xl py-12 px-12 min-h-full">
          {children}
        </div>
      </main>

      {/* RIGHT SIDEBAR: Calendar & Tools */}
      <aside 
        className={cn(
          "border-l border-border bg-card/30 flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out relative",
          isRightOpen ? "w-72 p-4" : "w-0 p-0 border-l-0 opacity-0 overflow-hidden"
        )}
      >
        <div className={cn("flex flex-col h-full gap-6 min-w-64", !isRightOpen && "hidden")}>
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Calendar</h3>
               <button 
                 onClick={() => setIsRightOpen(false)}
                 className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent/50"
               >
                 <PanelRightClose className="w-4 h-4" />
               </button>
            </div>
            
            <div className="bg-background rounded-lg border border-border p-2 shadow-sm">
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
                  head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                  row: "flex w-full mt-2",
                  cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground font-bold",
                  day_outside: "text-muted-foreground opacity-30",
                  day_disabled: "text-muted-foreground opacity-30",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  week_number: "text-muted-foreground/30 text-[9px] w-6 flex items-center justify-center font-mono select-none",
                }}
              />
           </div>
           
           <div className="flex-1">
                {/* Future Widgets Area */}
           </div>
        </div>
      </aside>

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