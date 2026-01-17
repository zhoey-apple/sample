import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { format, getISOWeek, startOfISOWeek, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Book, LogOut, ChevronRight, ChevronDown, Folder, FileText, Search, User, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronLeft, Hash, CheckSquare, List, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlans } from "@/hooks/use-plans";
import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plan } from "@/lib/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarDayButton } from "@/components/ui/calendar";

// Extracted Outline Item Component
const OutlineItem = ({ 
  label, 
  icon: Icon, 
  onClick, 
  isActive 
}: { 
  label: string, 
  icon: any, 
  onClick: () => void, 
  isActive?: boolean 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all text-left",
      isActive 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    )}
  >
    <Icon className="w-3 h-3 flex-shrink-0" />
    <span className="truncate">{label}</span>
  </button>
);

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  
  // Sidebar State
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

  const { getAllPlans, deletePlan } = usePlans();
  const { data: plans = [] } = getAllPlans();

  // Current Plan Data for Outline
  const pathParts = location.split('/');
  // Try to parse date from URL, fallback to today
  let currentDate = new Date();
  let currentPlanType = 'day';
  let dateStr = "";
  
  if (pathParts[1] && pathParts[2]) {
     try {
       currentDate = parseISO(pathParts[2]);
       currentPlanType = pathParts[1];
       dateStr = pathParts[2];
     } catch (e) {
       // ignore
     }
  }

  // Find the active plan object to generate outline
  const activePlan = plans.find(p => p.type === currentPlanType && p.date === dateStr);

  // Outline Generation Logic
  const outlineItems = [];
  if (activePlan) {
      if (activePlan.type === 'day') {
          outlineItems.push({ id: 'direction', label: 'Monthly Direction', icon: Book, targetId: 'section-direction' });
          outlineItems.push({ id: 'tasks', label: 'Task Flow', icon: List, targetId: 'section-tasks' });
          
          // Add tasks to outline
          if (activePlan.unfinishedTasks?.length > 0) {
              outlineItems.push({ id: 'unfinished', label: `Carried Over (${activePlan.unfinishedTasks.length})`, icon: CheckSquare, targetId: 'section-unfinished', nested: true });
          }
          if (activePlan.tasks?.length > 0) {
              outlineItems.push({ id: 'today', label: `Today's Tasks (${activePlan.tasks.length})`, icon: CheckSquare, targetId: 'section-today', nested: true });
          }

          outlineItems.push({ id: 'notes', label: 'Creative Thoughts', icon: FileText, targetId: 'section-notes' });
          
          // Parse headings from notes
          if (activePlan.notes) {
              const lines = activePlan.notes.split('\n');
              lines.forEach(line => {
                  const match = line.match(/^(#{1,3})\s+(.+)/);
                  if (match) {
                      outlineItems.push({ 
                          id: `heading-${match[2]}`, 
                          label: match[2], 
                          icon: Hash, 
                          targetId: 'section-notes', // Ideally scroll to specific heading but MVP just goes to editor
                          nested: true
                      });
                  }
              });
          }
          
          outlineItems.push({ id: 'habits', label: 'Habit Tracker', icon: CheckSquare, targetId: 'section-habits' });
      } else {
          // Generic outline for other plan types
          outlineItems.push({ id: 'notes', label: 'Notes & Goals', icon: FileText, targetId: 'section-notes' });
      }
  }

  const handleOutlineClick = (targetId: string) => {
      // Simple scroll logic
      // In a real app we might use refs, but for MVP we'll try to find by ID
      // or just focus the main areas
      // For now, we can scroll to sections if we add IDs to them in the page
      const el = document.getElementById(targetId);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
      }
  };

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

  const confirmDelete = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!planToDelete) return;

    deletePlan.mutate(planToDelete.id, {
        onSuccess: () => {
            // If the deleted plan is the one currently open, redirect to today
            if (activePlan && activePlan.id === planToDelete.id) {
                const today = format(new Date(), "yyyy-MM-dd");
                setLocation(`/day/${today}`);
            }
            setDeleteDialogOpen(false);
            setPlanToDelete(null);
        }
    });
  };

  // Group plans for sidebar
  const groupedPlans = {
    yearly: plans.filter(p => p.type === 'year').sort((a,b) => b.date.localeCompare(a.date)),
    monthly: plans.filter(p => p.type === 'month').sort((a,b) => b.date.localeCompare(a.date)),
    weekly: plans.filter(p => p.type === 'week').sort((a,b) => b.date.localeCompare(a.date)),
    daily: plans.filter(p => p.type === 'day').sort((a,b) => b.date.localeCompare(a.date))
  };

  // Custom Day Button for Calendar Context Menu
  const ContextMenuDayButton = (props: any) => {
    const { day } = props;
    const dateStr = format(day.date, "yyyy-MM-dd");
    const plan = plans.find(p => p.type === 'day' && p.date === dateStr);
    
    // We wrap CalendarDayButton
    const button = <CalendarDayButton {...props} />;

    if (!plan) return button;

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {button}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation?
                        confirmDelete(plan);
                    }}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Document
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
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
                                  <ContextMenu key={plan.id}>
                                    <ContextMenuTrigger>
                                        <Link href={`/${plan.type}/${plan.date}`}>
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
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        <ContextMenuItem 
                                            onClick={() => confirmDelete(plan)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                  </ContextMenu>
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
                components={{
                    DayButton: ContextMenuDayButton
                }}
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
                modifiers={{
                  hasPlan: (date) => plans.some(p => p.type === 'day' && p.date === format(date, "yyyy-MM-dd"))
                }}
                modifiersClassNames={{
                  hasPlan: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary/40 after:rounded-full"
                }}
              />
           </div>
           
           <div className="flex-1 border-t border-border/40 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Outline</h3>
                {outlineItems.length > 0 ? (
                    <div className="space-y-1 pl-1">
                        {outlineItems.map(item => (
                            <div key={item.id} className={cn(item.nested && "pl-4")}>
                                <OutlineItem 
                                    label={item.label} 
                                    icon={item.icon} 
                                    onClick={() => handleOutlineClick(item.targetId)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground italic px-2">No active plan open</div>
                )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan for <span className="font-medium text-foreground">{planToDelete ? format(parseISO(planToDelete.date), "MMMM d, yyyy") : 'this date'}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
