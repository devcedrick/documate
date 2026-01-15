import React from 'react'
import RegisterForm from './_components/register-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register'
}

const page = () => {
  return (
    <div className='min-h-dvh flex items-center justify-center'>
      <RegisterForm />
    </div>
  )
}

export default page
