import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { handleChatMessage } from '@/lib/ai/academic-chatbot';
import { generateStrategy, StrategyEngineData } from '@/lib/strategy/strategy-engine';
import { calculateSGPA } from '@/lib/calculations/sgpa';
import { RuleEngineContext } from '@/lib/ai/rule-engine';

const RATE_LIMIT_HOURLY = 50;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = authData.user.id;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // 1. Check Rate Limit (Count LLM calls in the last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const llmCalls = await prisma.chatMessage.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
        role: 'assistant',
        source: { startsWith: 'llm-' }
      }
    });

    // 2. Fetch required academic context
    const semesters = await prisma.semester.findMany({
      where: { userId },
      include: {
        subjects: {
          include: {
            marks: true
          }
        }
      },
      orderBy: { number: 'asc' }
    });

    // We need subject details properly formatted for StrategyEngineData
    // Let's fetch the GradeScale
    const gradeScale = await prisma.gradeScale.findFirst({
      where: { userId, isActive: true }
    });

    // If no grade scale, we can't really do math properly, but we can fallback
    const parsedGradeScale = gradeScale ? (gradeScale.grades as any) : [];

    // Let's fetch MarkingSchemes
    const markingSchemes = await prisma.markingScheme.findMany({
      where: { userId }
    });

    const activeSemester = semesters.find(s => s.status === 'active') || semesters[semesters.length - 1];
    
    let strategyData: StrategyEngineData = {
      gradeScale: parsedGradeScale,
      subjects: []
    };

    let currentSgpa = 0;
    
    if (activeSemester) {
      // Calculate current SGPA
      const subjectsWithMarks = activeSemester.subjects.map((sub: any) => {
        const scheme = markingSchemes.find((m: any) => m.id === sub.markingSchemeId);
        return {
          credits: sub.credits,
          marks: sub.marks.map((m: any) => ({
            componentName: m.componentName,
            obtainedMarks: m.obtainedMarks,
            maxMarks: m.maxMarks
          })),
          components: scheme ? (scheme.components as any) : []
        };
      });
      currentSgpa = calculateSGPA(subjectsWithMarks, parsedGradeScale);

      // Populate strategy data
      strategyData.subjects = activeSemester.subjects.map((sub: any) => {
        const scheme = markingSchemes.find((m: any) => m.id === sub.markingSchemeId);
        return {
          id: sub.id,
          name: sub.name,
          credits: sub.credits,
          marks: sub.marks.map((m: any) => ({
            ...m,
            examDate: m.examDate || null // ensure null instead of undefined
          })),
          components: scheme ? (scheme.components as any) : []
        };
      });
    }

    // Calculate trend (last few SGPAs)
    const sgpaTrend = semesters.map((sem: any) => {
       const subs = sem.subjects.map((sub: any) => {
        const scheme = markingSchemes.find((m: any) => m.id === sub.markingSchemeId);
        return {
          credits: sub.credits,
          marks: sub.marks.map((m: any) => ({
            componentName: m.componentName,
            obtainedMarks: m.obtainedMarks,
            maxMarks: m.maxMarks
          })),
          components: scheme ? (scheme.components as any) : []
        };
      });
      return calculateSGPA(subs, parsedGradeScale);
    });

    const context: RuleEngineContext = {
      strategyData,
      sgpaTrend,
      currentSgpa
    };

    // Save user message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message,
        source: 'user'
      }
    });

    let botResponse;

    if (llmCalls >= RATE_LIMIT_HOURLY) {
      // Enforce Rule Engine ONLY if LLM is rate limited
      // We can modify handleChatMessage to strictly bypass LLM, but for now we just process with rules
      const { processWithRules } = await import('@/lib/ai/rule-engine');
      const ruleMatch = processWithRules(message, context);
      
      if (ruleMatch.matched && ruleMatch.response) {
         botResponse = { content: ruleMatch.response, source: 'rule' as const };
      } else {
         botResponse = { 
           content: "You've reached the hourly limit for complex AI queries (50/hour). I can still answer basic questions like 'Best subject?' or 'Current SGPA?'.", 
           source: 'error' as const 
         };
      }
    } else {
      botResponse = await handleChatMessage(userId, message, context);
    }

    // Save bot message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: botResponse.content,
        source: botResponse.source
      }
    });

    return NextResponse.json({ 
      response: botResponse.content,
      source: botResponse.source
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = authData.user.id;

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
