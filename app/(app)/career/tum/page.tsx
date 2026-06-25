"use client";

import { useState } from "react";
import { ChecklistTracker, ChecklistItem } from "@/components/career/ChecklistTracker";
import { UniversityFitCard } from "@/components/career/UniversityFitCard";
import { CurriculumMapResult } from "@/lib/career/curriculum-mapper";

export default function TUMPlannerPage() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Maintain CGPA > 8.0', description: 'TUM converts this using the Bavarian formula. Target 1.5-2.0 in German scale.', isComplete: true },
    { id: '2', label: 'Clear APS Certificate', description: 'Mandatory for Indian students. Apply 6 months in advance.', isComplete: false },
    { id: '3', label: 'Get VPD from uni-assist', description: 'Convert Indian grades to German equivalent.', isComplete: false },
    { id: '4', label: 'Draft Motivation Letter', description: 'Must be highly specific to the TUM program.', isComplete: false },
    { id: '5', label: 'IELTS / TOEFL', description: 'Min 6.5 IELTS or 88 TOEFL.', isComplete: true },
  ]);

  const toggleItem = (id: string, isComplete: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, isComplete } : item));
  };

  // Dummy curriculum mapping
  const mockMapping: CurriculumMapResult[] = [
    { category: 'Mathematics', requiredCredits: 20, completedCredits: 24, isMet: true, matchedSubjects: ['Calculus', 'Linear Algebra'] },
    { category: 'Computer Science', requiredCredits: 40, completedCredits: 35, isMet: false, matchedSubjects: ['Algorithms', 'Data Structures'] },
    { category: 'Theoretical Informatics', requiredCredits: 10, completedCredits: 0, isMet: false, matchedSubjects: [] },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChecklistTracker 
        title="TUM Application Checklist" 
        description="Track your application progress"
        items={items}
        onToggle={toggleItem}
      />

      <div className="space-y-4">
        <UniversityFitCard 
          universityName="Technical University of Munich"
          programName="MSc Informatics"
          mappingResults={mockMapping}
        />
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 text-sm text-blue-800 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="font-semibold mb-1">Tip for TUM:</p>
          <p>Curricular analysis is extremely strict. Ensure you match exactly 100% of their required credit buckets, or you may be rejected regardless of CGPA.</p>
        </div>
      </div>
    </div>
  );
}
