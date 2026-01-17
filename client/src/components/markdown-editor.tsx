import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal state when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
    autoResize();
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [internalValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Simple list continuation logic
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentLineStart = internalValue.lastIndexOf('\n', start - 1) + 1;
      const currentLine = internalValue.substring(currentLineStart, start);

      // Check for list patterns: "- ", "* ", "1. ", "- [ ] "
      const listMatch = currentLine.match(/^(\s*)([-*] \[[ x]\]|[-*]|\d+\.)\s/);

      if (listMatch) {
        e.preventDefault();
        const prefix = listMatch[0];
        // If line is empty (just prefix), clear it
        if (currentLine.trim() === listMatch[0].trim()) {
           const newValue = internalValue.substring(0, currentLineStart) + internalValue.substring(start);
           setInternalValue(newValue);
           onChange(newValue);
           // Need to defer cursor set
           setTimeout(() => {
             textarea.selectionStart = textarea.selectionEnd = currentLineStart;
           }, 0);
        } else {
           // Continue list
           let nextPrefix = prefix;
           // If it was a checked task, uncheck it for next item
           if (prefix.includes('[x]')) {
             nextPrefix = prefix.replace('[x]', '[ ]');
           }
           // If numbered list, increment
           if (/\d+\./.test(prefix)) {
             const num = parseInt(prefix.match(/\d+/)![0]);
             nextPrefix = prefix.replace(/\d+/, (num + 1).toString());
           }

           const newValue = internalValue.substring(0, start) + '\n' + nextPrefix + internalValue.substring(end);
           setInternalValue(newValue);
           onChange(newValue);
           
           setTimeout(() => {
             textarea.selectionStart = textarea.selectionEnd = start + 1 + nextPrefix.length;
           }, 0);
        }
      }
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none border-none focus-visible:ring-0 bg-transparent p-0 text-base leading-relaxed font-mono text-foreground/90 min-h-[100px] overflow-hidden",
        className
      )}
    />
  );
}
