'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, Calculator, Target, CalendarDays, BrainCircuit, ScanLine, GraduationCap, Briefcase, Award, PenTool, ListChecks, Activity, Scale, FileText, Library } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Semesters', href: '/semesters', icon: Library },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Marks Entry', href: '/marks', icon: PenTool },
  { name: 'Semester Health', href: '/health', icon: Activity },
  { name: 'Compare Semesters', href: '/compare', icon: Scale },
  { name: 'Target Grade', href: '/target-grade', icon: Target },
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r border-border/40 bg-background/80 backdrop-blur-xl md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <GraduationCap className="h-6 w-6" />
            <span>Lumos</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-nav-pill"
                      className="absolute inset-0 bg-primary/10 rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
