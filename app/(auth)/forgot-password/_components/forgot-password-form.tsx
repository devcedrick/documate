"use client"

import React, { useEffect } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { useActionState } from 'react'
import { forgotPassword, ForgotPasswordActionState } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const initialState: ForgotPasswordActionState = null;

const ForgotPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)
  const router = useRouter();

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success('Email Sent', {
        description: state.success,
      });
      router.push('/login');
    }

    if (state.error && state.error !== 'Please enter a valid email address.') {
      toast.error('Error', {
        description: state.error,
      });
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className='text-2xl'>Forgot your password?</CardTitle>
        <CardDescription>
          {`No worries. Enter your email address and we’ll send you a link to reset your password.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className='flex flex-col gap-6'>
          <FormField 
            id='email'
            name='email'
            label='Email Address'
            type='email'
            placeholder='xyz@example.com'
            error={state?.error}
            required
          />
          <Button className='max-sm:w-full ml-auto' disabled={isPending} type='submit'>
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ForgotPasswordForm
