import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { PageTransition } from '@/components/motion/PageTransition'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-background relative">
      {/* Subtle Noise Overlay */}
      <div className="absolute inset-0 z-0 bg-noise pointer-events-none" />
      
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 w-full z-10">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:px-6 lg:px-8 py-8 md:gap-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
