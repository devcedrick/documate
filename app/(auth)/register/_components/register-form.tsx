'use client'

import React, { useActionState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FormField } from '@/components/form-field'
import SocialAuthButtons from '@/components/socialauth-buttons'
import { createAccount, type ActionState } from '../actions'
import { toast } from 'sonner'

const initialState: ActionState = null

const getFieldError = (
  state: ActionState,
  field: 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'
): string | undefined => {
  return state?.error?.properties?.[field]?.errors?.[0]
}

const RegisterForm = () => {
  const [state, formAction, isPending] = useActionState(createAccount, initialState)

  useEffect(() => {
    if (!state) return

    if (state.success) {
      toast.success('Account created!', {
        description: state.success,
      })
    }

    if (state.error?.message) {
      toast.error('Something went wrong', {
        description: state.error.message,
      })
    }
  }, [state])

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className='text-2xl font-semibold'>Create your account</CardTitle>
        <CardDescription>
          Get started in just a few seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex max-sm:flex-col items-center justify-center gap-2">
                <FormField
                  id="firstname"
                  name="firstname"
                  label="First Name"
                  placeholder="John"
                  error={getFieldError(state, 'firstName')}
                  defaultValue={state?.values?.firstName}
                  required
                />
                <FormField
                  id="lastname"
                  name="lastname"
                  label="Last Name"
                  placeholder="Doe"
                  error={getFieldError(state, 'lastName')}
                  defaultValue={state?.values?.lastName}
                  required
                />
              </div>

              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                placeholder="xyz@example.com"
                error={getFieldError(state, 'email')}
                defaultValue={state?.values?.email}
                required
              />

              <FormField
                id="password"
                name="password"
                label="Password"
                type="password"
                error={getFieldError(state, 'password')}
                required
              />

              <FormField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                error={getFieldError(state, 'confirmPassword')}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
        <Separator />
        <div className='flex justify-center items-center gap-2 my-3 overflow-hidden w-full'>
          <Separator />
          <p className='text-muted-foreground text-xs'>OR</p>
          <Separator />
        </div>
        <SocialAuthButtons />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="text-center text-sm">
          <p>
            Already have an account?{'   '}
            <a href="/login" className=" ml-1 text-primary underline-offset-4 hover:underline font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default RegisterForm
