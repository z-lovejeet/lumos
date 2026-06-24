'use client';

import { useState } from 'react';
import { BookOpen, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PYQAnalysisResult } from '@/lib/ai/pyq-analyzer';

export default function PYQPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PYQAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      const lines = text.split('\n')
        .filter(l => l.trim().length > 15)
        .map(l => ({ text: l.trim() }));
      
      const res = await fetch('/api/ai/pyq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: lines }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResult(data.data);
    } catch (err: any) {
      alert(err.message || 'Failed to analyze PYQs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          PYQ Analyzer
        </h1>
        <p className="text-muted-foreground">
          Paste previous year questions here. The AI will analyze topic weightage, frequency, and difficulty to help you prioritize your studying.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Questions</CardTitle>
          <CardDescription>Paste the raw text of question papers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Q1. Explain the differences between TCP and UDP.&#10;Q2. What is a binary search tree?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : 'Analyze Topic Weightage'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Topic Importance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.importanceRanking.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="font-medium capitalize">{item.topic}</span>
                    <Badge variant={i < 3 ? 'default' : 'secondary'}>Score: {item.score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tagged Questions</CardTitle>
              <CardDescription>AI-classified difficulty and topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.questions.map((q, i) => (
                <div key={i} className="border p-3 rounded-lg space-y-2">
                  <p className="text-sm font-medium">{q.text}</p>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Badge variant={
                      q.difficulty === 'Hard' ? 'destructive' : 
                      q.difficulty === 'Medium' ? 'default' : 'secondary'
                    }>
                      {q.difficulty}
                    </Badge>
                    {q.topics.map((t, idx) => (
                      <Badge key={idx} variant="outline" className="capitalize">{t}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
