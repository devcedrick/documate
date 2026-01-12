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
import { Check } from 'lucide-react'

const page = () => {
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
