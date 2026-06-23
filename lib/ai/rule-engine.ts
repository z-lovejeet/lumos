import { generateStrategy, StrategyEngineData } from '../strategy/strategy-engine';
import { detectRisks } from '../alerts/risk-detector';
import { predictAttendanceBuffer } from '../calculations/attendance';
import { GradeRange } from '../calculations/sgpa';
import { calculateRequiredMarks } from '../predictions/grade-predictor';
import { CalculationComponent, CalculationMark } from '../calculations/percentage';

export interface RuleEngineContext {
  strategyData: StrategyEngineData;
  sgpaTrend: number[];
  currentSgpa: number;
}

export interface RuleMatch {
  matched: boolean;
  response: string | null;
}

type RuleHandler = (query: string, context: RuleEngineContext) => string | null;

interface Rule {
  name: string;
  patterns: RegExp[];
  handler: RuleHandler;
}

const rules: Rule[] = [
  {
    name: 'Best Subject',
    patterns: [
      /best subject to improve/i,
      /what should i focus on/i,
      /how to increase my sgpa/i,
      /highest roi/i
    ],
    handler: (query, context) => {
      const recs = generateStrategy(context.strategyData);
      if (recs.length === 0) return "You're already maxing out your grades or have no upcoming exams!";
      const top = recs[0];
      return `Your best opportunity to improve your SGPA is to focus on **${top.subjectName}**. ${top.message}`;
    }
  },
  {
    name: 'My Status / Risk',
    patterns: [
      /my status/i,
      /am i failing/i,
      /am i at risk/i,
      /any warnings/i
    ],
    handler: (query, context) => {
      const alerts = detectRisks({
        sgpaTrend: context.sgpaTrend,
        gradeScale: context.strategyData.gradeScale,
        subjects: context.strategyData.subjects.map(s => ({
          ...s,
          attendancePercent: 100 // fallback if attendance not passed
        }))
      });
      if (alerts.length === 0) return "You are currently in a very safe zone. No academic or attendance risks detected!";
      
      const critical = alerts.filter(a => a.severity === 'critical');
      const warning = alerts.filter(a => a.severity === 'warning');
      
      let res = `You have ${alerts.length} active alerts.\n`;
      if (critical.length > 0) res += `**CRITICAL**: ${critical.map(a => a.message).join(' | ')}\n`;
      if (warning.length > 0) res += `**WARNING**: ${warning.map(a => a.message).join(' | ')}`;
      return res;
    }
  },
  {
    name: 'Target SGPA',
    patterns: [
      /can i get (\d+\.?\d*) sgpa/i,
      /what do i need for (\d+\.?\d*) sgpa/i
    ],
    handler: (query, context) => {
      const match = query.match(/(\d+\.?\d*)\s*sgpa/i);
      if (!match) return null;
      const target = parseFloat(match[1]);
      
      // Simple feasibility check - if target > max possible or unrealistic
      if (target > 10) return "Target SGPA cannot exceed 10.0.";
      
      const recs = generateStrategy(context.strategyData);
      const possibleImpact = recs.reduce((sum, r) => sum + r.sgpaImpact, 0);
      const maxPossibleSgpa = context.currentSgpa + possibleImpact;
      
      if (target > maxPossibleSgpa) {
        return `It is mathematically unlikely to hit ${target} SGPA. Based on your remaining exams, your maximum possible SGPA is around ${maxPossibleSgpa.toFixed(2)}.`;
      }
      return `Yes, ${target} SGPA is feasible. To get there, you need to gain roughly ${(target - context.currentSgpa).toFixed(2)} grade points. Ask me "What should I focus on?" for a strategy.`;
    }
  },
  {
    name: 'Current SGPA',
    patterns: [
      /what is my current sgpa/i,
      /my sgpa/i
    ],
    handler: (query, context) => {
      return `Your current calculated SGPA is **${context.currentSgpa.toFixed(2)}**.`;
    }
  },
  {
    name: 'Attendance Buffer',
    patterns: [
      /can i miss class/i,
      /attendance buffer/i,
      /how many classes can i miss/i
    ],
    handler: (query, context) => {
      // General overview
      return `If you want to know how many classes you can miss for a specific subject, please specify the subject name (e.g., "Can I miss Math classes?").`;
    }
  },
  {
    name: 'Subject Specific Attendance',
    patterns: [
      /can i miss (.+?)(?: classes|\?)/i,
      /how many (.+?) classes can i miss/i
    ],
    handler: (query, context) => {
      const match = query.match(/can i miss (.+?)(?: classes|\?)/i) || query.match(/how many (.+?) classes can i miss/i);
      if (!match) return null;
      const subjectQuery = match[1].trim().toLowerCase();
      
      const subject = context.strategyData.subjects.find(s => s.name.toLowerCase().includes(subjectQuery) || subjectQuery.includes(s.name.toLowerCase()));
      if (!subject) return `I couldn't find a subject matching "${subjectQuery}".`;
      
      return `For **${subject.name}**, please check your Attendance dashboard for the exact buffer. (Rule engine requires full attendance records to compute the buffer directly).`;
    }
  }
];

/**
 * Evaluates a query against standard regex patterns to provide instant, deterministic responses.
 */
export function processWithRules(query: string, context: RuleEngineContext): RuleMatch {
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(query)) {
        const response = rule.handler(query, context);
        if (response) {
          return { matched: true, response };
        }
      }
    }
  }
  
  return { matched: false, response: null };
}
