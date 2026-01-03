import React from 'react'
import LoginForm from './_components/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login'
}

const page = () => {
  return (
    <div className='h-dvh flex items-center justify-center'>
      <LoginForm />
    </div>
  )
}

export default page
