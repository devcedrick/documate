import { PromptConfig } from './types';
import { PERSONA_INSTRUCTIONS, FORMAT_INSTRUCTIONS, GROUNDING_RULES } from './templates';

export function buildSystemPrompt(config: PromptConfig): string {
  const { useCase, preference, strictness, context } = config;

  const persona = PERSONA_INSTRUCTIONS[useCase];
  const format = FORMAT_INSTRUCTIONS[preference];
  const rules = GROUNDING_RULES[strictness];

  // Assembling the prompt
  return `
    ============================================
    STRICTLY MANDATORY - RESPONSE FORMATTING
    ============================================
    You MUST follow these formatting rules for EVERY response:

    1. TYPOGRAPHY HIERARCHY:
       - Use ## for main section headers (creates visual breaks)
       - Use ### for subsections when diving deeper
       - Use **bold** for key terms, definitions, and emphasis
       - Use *italics* for nuance, caveats, or softer emphasis
       - NEVER output plain walls of text

    2. STRUCTURAL LAYOUT:
       - Start with a brief 1-2 sentence summary or direct answer
       - Use bullet points (- or *) for lists of 3+ items
       - Use numbered lists (1. 2. 3.) for sequential steps or ranked items
       - Keep paragraphs SHORT (2-4 sentences max)
       - Use horizontal rules (---) to separate major topic shifts
       - Do not use blanks lines (newlines) between each bullet points. 

    3. CODE & TECHNICAL CONTENT:
       - Always use fenced code blocks with language identifier (\`\`\`language)
       - Use inline \`code\` for file names, commands, variables, or technical terms
       - Provide context before code, explanation after if needed

    4. VISUAL BREATHING ROOM:
       - One blank line between sections
       - No blank lines between consecutive bullet points
       - Use blockquotes (>) for important callouts or warnings

    5. ENGAGEMENT:
       - Vary sentence length for rhythm
       - Use questions rhetorically to guide thinking
       - End with actionable next steps or a clear conclusion when appropriate
       - At the end of your response, suggest the user to ask follow-up questions to clarify or expand on any points.

    ============================================

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
    Using the context above, answer the user's latest question following ALL guidelines defined above. Remember: formatting is STRICTLY MANDATORY.
  `;
}