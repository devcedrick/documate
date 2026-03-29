import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import OnboardingContainer from './_components/onboarding-container'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'This is an onboarding page for new users.',
}

export interface InitialData {
  firstName: string;
  lastName: string;
}

export default async function Page() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login?redirect=/onboarding');
  }

  // Pre-fill data from user metadata if available
  const initialData: InitialData = {
    firstName: user.user_metadata?.first_name || '',
    lastName: user.user_metadata?.last_name || '',
  };

  return (
    <div className='flex min-h-dvh items-center justify-center px-4'>
      <div className='flex flex-col items-center justify-center w-3xl gap-3'>
        <h1 className='text-5xl font-bold mr-auto'>{`LET'S GET YOU SET UP`}</h1>
        <p className='text-muted-foreground mr-auto'>
          Just a few quick steps to personalize your experience and get you started.
        </p>
        <OnboardingContainer initialData={initialData} />
      </div>
    </div>
  )
}
