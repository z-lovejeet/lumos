'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { LayoutDashboard, BookOpen, Calculator, Target, CalendarDays, BrainCircuit, ScanLine, GraduationCap, Briefcase, Award, Activity, Scale, PenTool, ListChecks, FileText, Library } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Semesters', href: '/semesters', icon: Library },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Marks Entry', href: '/marks', icon: PenTool },
  { name: 'Semester Health', href: '/health', icon: Activity },
  { name: 'Compare Semesters', href: '/compare', icon: Scale },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Predictions', href: '/predictions', icon: Target },
  { name: 'What-If Strategy', href: '/what-if', icon: Target },
  { name: 'Attendance', href: '/attendance', icon: CalendarDays },
  { name: 'AI Assistant', href: '/chat', icon: BrainCircuit },
  { name: 'Smart Scanner', href: '/scanner', icon: ScanLine },
  { name: 'Transcript', href: '/transcript', icon: GraduationCap },
  { name: 'Marking Schemes', href: '/marking-schemes', icon: ListChecks },
  { name: 'Career Center', href: '/career', icon: Briefcase },
  { name: 'Achievements', href: '/achievements', icon: Award },
  { name: 'Export Center', href: '/export', icon: FileText },
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      } />
      <SheetContent side="left" className="flex flex-col w-[300px] sm:w-[350px] p-6 border-r-0 bg-background/95 backdrop-blur-xl">
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <div className="mb-6 flex flex-col gap-1">
          <span className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            AcademiQ
          </span>
          <span className="text-sm text-muted-foreground font-medium">Your Academic Copilot</span>
        </div>
        <nav className="flex flex-col gap-1.5 overflow-y-auto pb-8 -mx-2 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-70")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
