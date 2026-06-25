import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";

export default async function CareerLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const currentPath = headersList.get('x-invoke-path') || '';

  const navItems = [
    { name: 'Overview', href: '/career' },
    { name: 'MS Abroad', href: '/career/ms-abroad' },
    { name: 'TUM Planner', href: '/career/tum' },
    { name: 'Internships', href: '/career/internships' },
    { name: 'Projects', href: '/career/projects' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Career & Future Planning</h2>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}>
            <Button variant={currentPath === item.href || (item.name === 'Overview' && currentPath === '/career') ? "default" : "outline"} size="sm">
              {item.name}
            </Button>
          </Link>
        ))}
      </div>

      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
