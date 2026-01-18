import { cn } from "@/lib/utils";
import { PlanType } from "@/lib/types";

interface SectionPromptsProps {
  type: PlanType;
  className?: string;
}

export function SectionPrompts({ type, className }: SectionPromptsProps) {
  const prompts = {
    day: [
      "How do you feel about your accomplishments?",
      "What prevented you from working optimally?",
      "Any creative breakthroughs today?"
    ],
    week: [
      "What are your top 3 priorities this week?",
      "How can you align your schedule with your values?",
      "What distractions should you avoid?"
    ],
    month: [
      "Did you finish last month's initiatives?",
      "If so, how do you think you did?",
      "If not, what needs to change next month?"
    ],
    year: [
      "What is your core vision for this year?",
      "How do these goals align with your Life Principles?",
      "What habits will support this vision?"
    ]
  };

  const currentPrompts = prompts[type] || prompts.day;

  return (
    <div className={cn("space-y-2 mb-4", className)}>
      {currentPrompts.map((prompt, i) => (
        <p key={i} className="text-sm text-muted-foreground/60 italic font-serif leading-relaxed">
          {prompt}
        </p>
      ))}
    </div>
  );
}
