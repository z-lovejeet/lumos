'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, Calculator, Target, CalendarDays, BrainCircuit, ScanLine, GraduationCap, Briefcase, Award, PenTool, ListChecks } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'What-If Strategy', href: '/strategy', icon: Target },
  { name: 'Attendance', href: '/attendance', icon: CalendarDays },
  { name: 'AI Assistant', href: '/chat', icon: BrainCircuit },
  { name: 'Smart Scanner', href: '/scanner', icon: ScanLine },
  { name: 'Transcript', href: '/transcript', icon: GraduationCap },
  { name: 'Marks Entry', href: '/marks', icon: PenTool },
  { name: 'Marking Schemes', href: '/marking-schemes', icon: ListChecks },
  { name: 'Career Center', href: '/career', icon: Briefcase },
  { name: 'Achievements', href: '/achievements', icon: Award },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-zinc-50/50 dark:bg-zinc-900/50 md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <GraduationCap className="h-6 w-6" />
            <span>AcademiQ</span>
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
