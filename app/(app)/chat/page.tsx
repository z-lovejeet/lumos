import { ChatWindow } from "@/components/chat/ChatWindow";

export const metadata = {
  title: "AI Copilot - Lumos",
  description: "Chat with your personal academic intelligence.",
};

export default function ChatPage() {
  return (
    <div className="container max-w-5xl py-6 h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Copilot</h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about your academic status, grades, and strategy.
        </p>
      </div>

      <ChatWindow />
    </div>
  );
}
