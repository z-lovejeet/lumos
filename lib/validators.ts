import { z } from "zod"

// Semester Schema
export const semesterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Semester name is required"),
  startDate: z.date(),
  endDate: z.date(),
})

export type SemesterFormValues = z.infer<typeof semesterSchema>

// Marking Scheme Component Schema
export const schemeComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Component name is required"), // e.g. "Midterm", "Assignment 1"
  weight: z.number().min(0).max(100),
  maxMarks: z.number().min(1, "Max marks must be greater than 0")
})

export type SchemeComponentFormValues = z.infer<typeof schemeComponentSchema>

// Marking Scheme Schema
export const markingSchemeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Marking scheme name is required"), // e.g. "Standard Theory"
  components: z.array(schemeComponentSchema)
    .min(1, "At least one component is required")
    .refine((components) => {
      const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);
      return totalWeight === 100;
    }, "Total weight must equal exactly 100%"),
})

export type MarkingSchemeFormValues = z.infer<typeof markingSchemeSchema>

// Subject Schema
export const subjectSchema = z.object({
  id: z.string().optional(),
  semesterId: z.string().min(1, "Semester is required"),
  code: z.string().min(1, "Subject code is required"), // e.g. "CS101"
  name: z.string().min(1, "Subject name is required"), // e.g. "Intro to Computer Science"
  credits: z.number().min(0.5, "Credits must be at least 0.5"),
  category: z.string().min(1, "Category is required"), // e.g. "Core", "Elective"
  facultyName: z.string().optional(),
  colorCode: z.string().optional(),
  markingSchemeId: z.string().optional(), // Can be assigned later
})

export type SubjectFormValues = z.infer<typeof subjectSchema>

// Grade Range Schema
export const gradeRangeSchema = z.object({
  id: z.string().optional(),
  grade: z.string().min(1, "Grade label is required"), // e.g. "A+", "A"
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  gpaValue: z.number().min(0).max(10), // e.g. 4.0 or 10.0 scale
}).refine(data => data.minPercentage < data.maxPercentage, {
  message: "Min percentage must be less than max percentage",
  path: ["minPercentage"],
})

export type GradeRangeFormValues = z.infer<typeof gradeRangeSchema>

// Grade Scale Schema
export const gradeScaleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Grade scale name is required"), // e.g. "10-Point CGPA"
  ranges: z.array(gradeRangeSchema)
    .min(2, "At least two grade ranges are required")
})

export type GradeScaleFormValues = z.infer<typeof gradeScaleSchema>
