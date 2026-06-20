import { getGradeScales } from './actions'
import { GradeScaleClient } from '@/components/grade-scales/GradeScaleClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Grade Scales - AcademiQ',
  description: 'Manage your grade scales (e.g. 10-Point CGPA, 4.0 GPA)',
}

export default async function GradeScalesPage() {
  try {
    const { scales } = await getGradeScales()
    
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Grade Scales</h2>
        </div>
        <GradeScaleClient initialScales={scales} />
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}
