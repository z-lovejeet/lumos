import { getSubjects } from './actions'
import { getSemesters } from '@/app/(app)/semesters/actions'
import { SubjectClient } from '@/components/subjects/SubjectClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Subjects - AcademiQ',
  description: 'Manage your academic subjects and courses',
}

export default async function SubjectsPage() {
  try {
    const [subjectsRes, semestersRes] = await Promise.all([
      getSubjects(),
      getSemesters()
    ])
    
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
        </div>
        <SubjectClient 
          initialSubjects={subjectsRes.subjects} 
          initialSemesters={semestersRes.semesters} 
        />
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}
