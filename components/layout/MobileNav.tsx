'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { LayoutDashboard, BookOpen, Calculator, Target, CalendarDays, BrainCircuit, ScanLine, GraduationCap, Briefcase, Award } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Predictions', href: '/predictions', icon: Target },
  { name: 'What-If Strategy', href: '/what-if', icon: Target },
  { name: 'Attendance', href: '/attendance', icon: CalendarDays },
  { name: 'AI Assistant', href: '/chat', icon: BrainCircuit },
  { name: 'Smart Scanner', href: '/scanner', icon: ScanLine },
  { name: 'Transcript', href: '/transcript', icon: GraduationCap },
  { name: 'Career Center', href: '/career', icon: Briefcase },
  { name: 'Achievements', href: '/achievements', icon: Award },
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
      <SheetContent side="left" className="flex flex-col">
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
            onClick={() => setOpen(false)}
          >
            <GraduationCap className="h-6 w-6" />
            <span>AcademiQ</span>
          </Link>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
