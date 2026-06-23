import { RuleEngineContext, processWithRules } from './rule-engine';
import { buildAcademicSystemPrompt } from './prompt-builder';
import { queryLLM } from './llm-router';
import { llmCache } from './response-cache';

export interface ChatbotResponse {
  content: string;
  source: 'rule' | 'llm-gemini' | 'llm-groq' | 'error';
}

export async function handleChatMessage(
  userId: string,
  message: string,
  context: RuleEngineContext
): Promise<ChatbotResponse> {
  // 1. Try Rule Engine (Tier 1)
  const ruleMatch = processWithRules(message, context);
  if (ruleMatch.matched && ruleMatch.response) {
    return {
      content: ruleMatch.response,
      source: 'rule'
    };
  }

  // 2. Check Cache
  const cachedResponse = llmCache.get(userId, message);
  if (cachedResponse) {
    return {
      content: cachedResponse,
      source: 'llm-gemini' // cache doesn't store provider perfectly, but we'll assume LLM
    };
  }

  // 3. Try LLM (Tier 4)
  const systemPrompt = buildAcademicSystemPrompt(context);
  const llmResult = await queryLLM(systemPrompt, message);

  // 4. Cache successful responses
  if (llmResult.provider !== 'error') {
    llmCache.set(userId, message, llmResult.content);
  }

  return {
    content: llmResult.content,
    source: llmResult.provider === 'gemini' ? 'llm-gemini' : 
            llmResult.provider === 'groq' ? 'llm-groq' : 'error'
  };
}
