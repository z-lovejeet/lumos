import { create } from 'zustand'

export interface Semester {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

export interface Subject {
  id: string
  semesterId: string
  code: string
  name: string
  credits: number
  category: string
  facultyName?: string | null
  colorCode?: string | null
  markingSchemeId?: string | null
}

interface AcademicState {
  semesters: Semester[]
  subjects: Subject[]
  activeSemesterId: string | null
  isLoading: boolean
  
  // Actions
  setSemesters: (semesters: Semester[]) => void
  setSubjects: (subjects: Subject[]) => void
  setActiveSemester: (id: string | null) => void
  addSemester: (semester: Semester) => void
  updateSemester: (id: string, data: Partial<Semester>) => void
  removeSemester: (id: string) => void
  addSubject: (subject: Subject) => void
  updateSubject: (id: string, data: Partial<Subject>) => void
  removeSubject: (id: string) => void
}

export const useAcademicStore = create<AcademicState>((set) => ({
  semesters: [],
  subjects: [],
  activeSemesterId: null,
  isLoading: false,

  setSemesters: (semesters) => set({ semesters }),
  setSubjects: (subjects) => set({ subjects }),
  setActiveSemester: (id) => set({ activeSemesterId: id }),
  
  addSemester: (semester) => set((state) => ({ 
    semesters: [...state.semesters, semester] 
  })),
  
  updateSemester: (id, data) => set((state) => ({
    semesters: state.semesters.map((s) => s.id === id ? { ...s, ...data } : s)
  })),
  
  removeSemester: (id) => set((state) => ({
    semesters: state.semesters.filter((s) => s.id !== id),
    activeSemesterId: state.activeSemesterId === id ? null : state.activeSemesterId
  })),
  
  addSubject: (subject) => set((state) => ({ 
    subjects: [...state.subjects, subject] 
  })),
  
  updateSubject: (id, data) => set((state) => ({
    subjects: state.subjects.map((s) => s.id === id ? { ...s, ...data } : s)
  })),
  
  removeSubject: (id) => set((state) => ({
    subjects: state.subjects.filter((s) => s.id !== id)
  })),
}))
