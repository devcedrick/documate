"use client"

import React, { useState, useActionState, useEffect, useTransition } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import IdentityProtocolForm from './steps/step-identity'
import DirectiveForm from './steps/step-directive'
import ResponsePreferenceForm from './steps/step-response'
import StrictnessLevelForm from './steps/step-strictness'
import { completeOnboarding, OnboardingActionState } from '../actions'
import { toast } from 'sonner'


const OnboardingContainer = ({initialData}: {initialData: any}) => {
  const [step, setStep] = useState(1);
  const totalStep = 4;
  const progress = (step / totalStep) * 100;

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    useCase: '',
    responsePreference: 'detailed', // DEFAULT
    strictnessLevel: 'strict' // DEFAULT
  })

  const [state, formAction, isPending] = useActionState(completeOnboarding, null);
  const [, startTransition] = useTransition();

  // Handle server action response
  useEffect(() => {
    if (state?.error?.message) {
      toast.error(state.error.message);
    }
    if (state?.success) {
      toast.success(state.success);
    }
  }, [state]);

  const handleNext = () => {
    if (step < totalStep) {
      setStep(step + 1);
    }
  }

  const canNavigateNext = (): boolean => {
    switch (step) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim();
      case 2:
        return formData.useCase !== '';
      default:
        return false;
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const getDesc = () => {
    if (step === 1) {
      return "Establish your operator profile. Confirm your details to personalize your workspace and session context."
    } else if (step === 2) {
      return "Initialize the AI's behavioral model. Select the persona that aligns with your specific workflow goals."
    } else if (step === 3) {
      return "Configure output density. Determine the depth, format, and complexity of the answers you receive."
    } else if (step === 4) {
      return "Set the hallucination filter threshold. Control how strictly the AI must adhere to the provided documents."
    }
  }

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  const handleSubmit = () => {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('firstName', formData.firstName);
    formDataToSubmit.append('lastName', formData.lastName);
    formDataToSubmit.append('useCase', formData.useCase);
    formDataToSubmit.append('responsePreference', formData.responsePreference);
    formDataToSubmit.append('strictnessLevel', formData.strictnessLevel);
    
    startTransition(() => {
      formAction(formDataToSubmit);
    });
  }
  

  return (
    <Card className='w-full min-h-110'>
      <CardHeader>
        <CardTitle className='text-xl'>
          {step === 1 && "Identity Protocol"}
          {step === 2 && "How will you use Documate?"}
          {step === 3 && "How detailed should answers be?"}
          {step === 4 && "How strictly should we stick to the file?"}
        </CardTitle>
        <CardDescription>{getDesc()}</CardDescription>
        <div className='flex gap-4 items-center justify-center mt-4'>
          <Progress value={progress} className='h-3 rounded-full' />
          <p className='text-sm'>{progress}%</p>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <IdentityProtocolForm
            firstName={formData.firstName}
            lastName={formData.lastName}
            onFirstNameChange={(value) => updateForm('firstName', value)}
            onLastNameChange={(value) => updateForm('lastName', value)}
          />
        )}
        {step === 2 && (
          <DirectiveForm 
            value={formData.useCase}
            onChange={(value) => updateForm('useCase', value)}
          />
        )}
        {step === 3 && (
          <ResponsePreferenceForm 
            value={formData.responsePreference}
            onChange={(value) => updateForm('responsePreference', value)}
          />
        )}
        {step === 4 && (
          <StrictnessLevelForm 
            value={formData.strictnessLevel}
            onChange={(value) => updateForm('strictnessLevel', value)}
          />
        )}
      </CardContent>
      <CardFooter className='flex items-center gap-3 justify-end mt-auto'>
        <Button variant='outline' onClick={handleBack} disabled={step === 1 || isPending}>
          <ArrowLeft/> Back
        </Button>
        {step !== totalStep ? (
          <Button className='flex-row-reverse' onClick={handleNext} disabled={!canNavigateNext()}>
            <ArrowRight /> Next
          </Button>
        ) : (
          <Button 
            className='flex-row-reverse' 
            onClick={handleSubmit} 
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Check />}
            {isPending ? 'Saving...' : 'Finish'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default OnboardingContainer;
