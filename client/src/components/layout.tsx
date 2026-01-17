import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Book, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    setLocation(`/day/${dateStr}`);
  };

  // Get current date from URL if possible to highlight in calendar
  const pathParts = location.split('/');
  const currentDate = pathParts[1] === 'day' && pathParts[2] ? new Date(pathParts[2]) : new Date();

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      {/* Sidebar / Navigation */}
      <aside className="w-80 border-r border-border bg-card flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
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
          </nav>

          <div className="mb-8">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
              Calendar
            </div>
            <div className="bg-background rounded-lg border border-border p-2 shadow-sm">
              <DayPicker
                mode="single"
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
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-border">
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto py-12 px-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
