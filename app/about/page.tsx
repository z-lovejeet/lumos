import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, BrainCircuit, LineChart, Lock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="w-full p-6 max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center py-12 px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            About Lumos
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Built for Ambitious Students.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Lumos was designed to take the guesswork out of academics. Stop manually calculating what you need on your finals—let the system optimize your entire semester strategy.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full mb-20">
          <div className="flex flex-col space-y-3 p-8 rounded-2xl border bg-card/40 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Predictive Analytics</h3>
            <p className="text-muted-foreground">
              Simulate exactly how a specific exam score will impact your final SGPA and overall CGPA. Instantly know your target scores before stepping into the exam hall.
            </p>
          </div>

          <div className="flex flex-col space-y-3 p-8 rounded-2xl border bg-card/40 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">AI Strategy Advisor</h3>
            <p className="text-muted-foreground">
              An intelligent assistant that analyzes your past performance and tells you exactly which subjects to prioritize to maximize your CGPA with the least effort.
            </p>
          </div>

          <div className="flex flex-col space-y-3 p-8 rounded-2xl border bg-card/40 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Attendance Defense</h3>
            <p className="text-muted-foreground">
              Input how many classes you plan to skip. The engine dynamically calculates your buffer and warns you before you drop below the critical 75% threshold.
            </p>
          </div>

          <div className="flex flex-col space-y-3 p-8 rounded-2xl border bg-card/40 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">100% Private & Secure</h3>
            <p className="text-muted-foreground">
              Your academic data is yours. It is securely encrypted and stored, meaning your grades, attendance, and career plans are entirely private.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-primary/5 rounded-3xl p-10 md:p-16 w-full border border-primary/10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to take control of your academics?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the students who are studying smarter, tracking their attendance, and optimizing their CGPA effortlessly.
          </p>
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8 text-md h-12">
              Get Started Now
            </Button>
          </Link>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Lumos. All rights reserved.
      </footer>
    </div>
  );
}
