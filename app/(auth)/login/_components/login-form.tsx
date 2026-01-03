import React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FcGoogle as GoogleIcon } from 'react-icons/fc'
import { FaGithub as GithubIcon } from 'react-icons/fa'


const LoginForm = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="xyz@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
              <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline mt-1"
                >
                  Forgot your password?
                </a>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className='flex justify-center items-center gap-2 my-3 overflow-hidden w-full'>
          <Separator />
          <p className='text-muted-foreground text-xs'>OR</p>
          <Separator />
        </div>
        {/* <Button variant="outline" className="w-full">
          Login with Google
        </Button> */}
        <Button variant="outline" className="w-full gap-2">
          <GoogleIcon /> Log in with Google
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <GithubIcon /> Log in with GitHub
        </Button>
        <div className="text-center text-sm mt-5">
          <p>
            Don't have an account?{'   '}
            <a href="#" className=" ml-1text-primary underline-offset-4 hover:underline font-semibold">
              Sign up for free
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default LoginForm;
