"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  isComplete: boolean;
}

interface ChecklistTrackerProps {
  title: string;
  description?: string;
  items: ChecklistItem[];
  onToggle: (id: string, isComplete: boolean) => void;
}

export function ChecklistTracker({ title, description, items, onToggle }: ChecklistTrackerProps) {
  const completedCount = items.filter(i => i.isComplete).length;
  const progressPercent = items.length === 0 ? 0 : (completedCount / items.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox 
                  id={item.id} 
                  checked={item.isComplete}
                  onCheckedChange={(checked) => onToggle(item.id, checked === true)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={item.id}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.isComplete ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.label}
                  </label>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
