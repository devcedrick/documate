"use client"

import React, { useActionState, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { updatePassword, type UpdatePasswordActionState } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

const initialState: UpdatePasswordActionState = null;

const getFieldError = (
  state: UpdatePasswordActionState,
  field: 'password' | 'confirmPassword'
): string | undefined => {
  return state?.error?.properties?.[field]?.errors?.[0]
}

const UpdatePasswordForm = () => {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient()
    let timeoutId: NodeJS.Timeout;

    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const isRecoveryFlow = hashParams.get('type') === 'recovery'

    if (!isRecoveryFlow) {
      toast.error('Invalid Access', {
        description: 'Please use the link from your password reset email.',
      });
      router.push('/forgot-password');
      return;
    }

    timeoutId = setTimeout(() => {
      if (!isSessionReady) {
          toast.error('Session Expired', {
              description: 'Your password reset session has expired. Please try again.',
          });
          router.push('/forgot-password');
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setIsSessionReady(true)
          clearTimeout(timeoutId);
        } else if (session) {
          setIsSessionReady(true)
        }
      }
    )

    // Check if there's already a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSessionReady(true)
        clearTimeout(timeoutId);
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId);
    }
  }, [])

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success('Password Updated', {
        description: state.success,
      });
      router.push('/login');
    }

    if (state.error?.message) {
      toast.error('Error', {
        description: state.error.message,
      });
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className='text-2xl'>Update your password</CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it's at least 6 characters long.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className='flex flex-col gap-6'>
          <FormField 
            id='password'
            name='password'
            label='New Password'
            type='password'
            placeholder='Enter your new password'
            error={getFieldError(state, 'password')}
            disabled={!isSessionReady}
            required
          />
          <FormField 
            id='confirmPassword'
            name='confirmPassword'
            label='Confirm Password'
            type='password'
            placeholder='Confirm your new password'
            error={getFieldError(state, 'confirmPassword')}
            disabled={!isSessionReady}
            required
          />
          <Button className='w-full' disabled={isPending || !isSessionReady} type='submit'>
            {!isSessionReady ? 'Verifying...' : isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default UpdatePasswordForm
