export type UseCase = 'student' | 'legal' | 'research' | 'technical' | 'general';
export type ResponsePreference = 'concise' | 'detailed' | 'eli5';
export type StrictnessLevel = 'strict' | 'balanced' | 'creative';

export interface PromptConfig {
  useCase: UseCase;
  preference: ResponsePreference;
  strictness: StrictnessLevel;
  context: string;
}