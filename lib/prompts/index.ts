import { PromptConfig } from './types';
import { PERSONA_INSTRUCTIONS, FORMAT_INSTRUCTIONS, GROUNDING_RULES } from './templates';

export function buildSystemPrompt(config: PromptConfig): string {
  const { useCase, preference, strictness, context } = config;

  const persona = PERSONA_INSTRUCTIONS[useCase];
  const format = FORMAT_INSTRUCTIONS[preference];
  const rules = GROUNDING_RULES[strictness];

  // Assembling the prompt
  return `
    SYSTEM IDENTITY:
    ${persona}

    RESPONSE GUIDELINES:
    ${format}

    GROUNDING & TRUTH:
    ${rules}

    --------------------------------
    CONTEXT (DOCUMENT EXCERPTS):
    ${context}
    --------------------------------

    INSTRUCTIONS:
    Using the context above, answer the user's latest question following the strict guidelines defined above.
  `;
}