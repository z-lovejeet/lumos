"use client";

import { cn } from "@/lib/utils";
import { User, Bot, Zap, BrainCircuit } from "lucide-react";

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  source?: string; // 'rule', 'llm-gemini', 'llm-groq', 'error'
}

export function MessageBubble({ role, content, source }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex max-w-[85%] rounded-2xl p-4 gap-3 shadow-sm",
        isUser ? "bg-primary text-primary-foreground ml-12" : "bg-card border mr-12"
      )}>
        
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot size={18} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 w-full">
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
          
          {!isUser && source && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {source === 'rule' && <><Zap size={10} className="text-amber-500" /> Instant Calculation</>}
              {source.startsWith('llm') && <><BrainCircuit size={10} className="text-blue-500" /> AI Generated ({source.replace('llm-', '')})</>}
              {source === 'error' && <span className="text-destructive">System Error</span>}
            </div>
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User size={18} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
