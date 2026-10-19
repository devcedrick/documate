import { z } from 'zod';

export const USE_CASE_VALUES = ['student', 'legal', 'research', 'technical', 'general'] as const;
export const RESPONSE_PREFERENCE_VALUES = ['concise', 'detailed', 'eli5'] as const;
export const STRICTNESS_LEVEL_VALUES = ['strict', 'balanced', 'creative'] as const;

export const onboardingSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters'),
  useCase: z
    .enum(USE_CASE_VALUES, {
      message: 'Please select how you will use Documate',
    }),
  responsePreference: z
    .enum(RESPONSE_PREFERENCE_VALUES, {
      message: 'Please select a response preference',
    }),
  strictnessLevel: z
    .enum(STRICTNESS_LEVEL_VALUES, {
      message: 'Please select a strictness level',
    }),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
