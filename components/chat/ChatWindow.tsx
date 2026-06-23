"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { SuggestedQueries } from "./SuggestedQueries";
import { Send, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/ai/chat');
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error("Failed to fetch chat history:", e);
      } finally {
        setIsFetchingHistory(false);
      }
    }
    fetchHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          source: data.source
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || "Failed to process request.",
          source: 'error'
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Network error occurred.",
        source: 'error'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    // We don't have an API to delete all yet, just clear UI for now
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-xl border overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            AcademiQ Copilot
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">BETA</span>
          </h2>
          <p className="text-xs text-muted-foreground">AI Academic Assistant</p>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="Clear Screen">
          <RefreshCcw size={16} />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {isFetchingHistory ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading history...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 max-w-sm mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Bot size={32} />
            </div>
            <h3 className="font-semibold text-foreground">Welcome to AcademiQ Copilot</h3>
            <p className="text-sm">I can instantly analyze your grades, predict your SGPA, and recommend exactly what you need to study.</p>
            <div className="pt-8 w-full">
               <SuggestedQueries onSelect={sendMessage} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map(msg => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} source={msg.source} />
            ))}
            
            {isLoading && (
              <div className="flex w-full mb-6 justify-start">
                <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && !isLoading && (
            <div className="mb-3">
              <SuggestedQueries onSelect={sendMessage} />
            </div>
          )}
          <div className="relative flex items-end gap-2">
            <Textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your SGPA, grades, or strategy..."
              className="min-h-[50px] max-h-[150px] resize-none pb-3 pt-3 px-4 rounded-2xl bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <Button 
              size="icon" 
              className="h-[50px] w-[50px] rounded-full shrink-0 shadow-md"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            AI can make mistakes. Always double-check important mathematical predictions.
          </p>
        </div>
      </div>

    </div>
  );
}
