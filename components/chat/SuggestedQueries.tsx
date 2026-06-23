"use client";

import { Button } from "@/components/ui/button";

interface SuggestedQueriesProps {
  onSelect: (query: string) => void;
}

export function SuggestedQueries({ onSelect }: SuggestedQueriesProps) {
  const queries = [
    "What is my current SGPA?",
    "Am I at risk of failing?",
    "Best subject to improve?",
    "Can I get 8.5 SGPA?",
    "How to increase my SGPA?",
    "What should I focus on?"
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {queries.map((q, i) => (
        <Button 
          key={i} 
          variant="secondary" 
          size="sm" 
          className="text-xs rounded-full bg-secondary/50 hover:bg-secondary border shadow-sm"
          onClick={() => onSelect(q)}
        >
          {q}
        </Button>
      ))}
    </div>
  );
}
