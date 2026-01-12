"use client"

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
import { loginUser, type LoginActionState } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const initialState: LoginActionState = null

const getFieldError = (
  state: LoginActionState,
  field: 'email' | 'password'
): string | undefined => state?.error?.properties?.[field]?.errors?.[0]

const LoginForm = () => {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginUser, initialState)

  useEffect(() => {
    if (!state) return

    if (state.success) {
      toast.success('Logged in', {
        description: state.success,
      })
      router.push('/onboarding')
    }

    if (state.error?.message) {
      toast.error('Login failed', {
        description: state.error.message,
      })
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className='text-2xl'>Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue where you left off.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-6">
            <FormField
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="xyz@example.com"
              defaultValue={state?.values?.email}
              error={getFieldError(state, 'email')}
              required
            />

            <FormField
              id="password"
              name="password"
              label="Password"
              type="password"
              error={getFieldError(state, 'password')}
              required
            >
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline mt-1"
              >
                Forgot your password?
              </a>
            </FormField>
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
        </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className='flex justify-center items-center gap-2 mb-3 overflow-hidden w-full'>
          <Separator />
          <p className='text-muted-foreground text-xs'>OR</p>
          <Separator />
        </div>
        <SocialAuthButtons />
        <div className="text-center text-sm mt-5">
          <p>
            Don't have an account?{'   '}
            <a href="/register" className=" ml-1 text-primary underline-offset-4 hover:underline font-semibold">
              Sign up for free
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default LoginForm;
