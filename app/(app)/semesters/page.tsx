import { getSemesters } from './actions'
import { SemesterClient } from '@/components/semesters/SemesterClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Semesters - AcademiQ',
  description: 'Manage your academic semesters',
}

export default async function SemestersPage() {
  try {
    const { semesters } = await getSemesters()
    
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Semesters</h2>
        </div>
        <SemesterClient initialSemesters={semesters} />
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}
