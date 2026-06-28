import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-react'
import Link from 'next/link'

import { MobileNav } from './MobileNav'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-md px-6 lg:h-[60px] sticky top-0 z-50">
      <MobileNav />
      <div className="w-full flex-1">
        {/* Search or breadcrumbs can go here */}
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-full" })}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <form action="/auth/signout" method="post">
            <button className="w-full text-left" type="submit">
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
