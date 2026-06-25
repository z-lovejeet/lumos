export interface MSAbroadProfile {
  targetCountry: string;
  targetTerm: string;
  greScore?: number;
  toeflIeltsScore?: number;
  researchPapers?: number;
  workExperienceMonths?: number;
}

export interface InternshipApplication {
  id: string;
  companyName: string;
  role: string;
  status: 'wishlist' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedDate?: string;
  notes?: string;
}

export interface InternshipPlan {
  targetRoles: string[];
  applications: InternshipApplication[];
}

export interface TUMProfile {
  targetProgram: string;
  bachelorsDegree: string;
  germanProficiency: 'none' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  hasAPS: boolean;
  hasVPD: boolean;
  motivationLetterDrafted: boolean;
}

export interface CareerPlan {
  id: string;
  userId: string;
  type: 'ms-abroad' | 'internship' | 'placement' | 'tum';
  data: MSAbroadProfile | InternshipPlan | TUMProfile | Record<string, unknown>;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface MSReadinessScore {
  academics: number;      // based on CGPA
  testScores: number;     // based on GRE/IELTS
  experience: number;     // work exp, papers
  applications: number;   // application completion
  overall: number;        // weighted average
  missingFactors: string[];
}
