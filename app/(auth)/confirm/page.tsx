import React from 'react'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Check } from 'lucide-react'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Confirm Your Email',
  description: 'We have sent you a confirmation link to your email address.',
}

const page = async () => {
  const cookieStore = await cookies()
  const signupComplete = cookieStore.get('signup_complete')

  if (!signupComplete) {
    redirect('/register')
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <Card className="w-full max-w-md">
        <CardContent className='flex flex-col items-center justifu-center gap-2'>
          <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h1 className='text-lg font-medium'>Confirm Your Email</h1>
          <p className='text-center text-muted-foreground'>
            {`We’ve sent you a confirmation link. Open your inbox and click the link to finish setting up your account.`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default page
