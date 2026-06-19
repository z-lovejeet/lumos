import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <main className="flex flex-col items-center text-center space-y-8 px-6 max-w-3xl">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            The Ultimate Academic OS
          </h1>
          <p className="text-xl text-muted-foreground">
            More than just a CGPA calculator. Predict grades, optimize your study strategy, and plan your career with an AI-powered advisor.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full">Get Started</Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="rounded-full">Learn More</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
