import { getMarkingSchemes } from './actions'
import { MarkingSchemeClient } from '@/components/marking-schemes/MarkingSchemeClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Marking Schemes - Lumos',
  description: 'Manage your grading structures and marking schemes',
}

export default async function MarkingSchemesPage() {
  try {
    const { schemes } = await getMarkingSchemes()
    
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Marking Schemes</h2>
        </div>
        <MarkingSchemeClient initialSchemes={schemes} />
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}
