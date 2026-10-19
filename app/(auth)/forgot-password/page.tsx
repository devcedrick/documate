import ForgotPasswordForm from './_components/forgot-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your password by entering your email address.',
}

const ForgotPasswordPage = () => {
  return (
    <div className='min-h-dvh w-full flex items-center justify-center p-4'>
      <ForgotPasswordForm />
    </div>
  )
}

export default ForgotPasswordPage
