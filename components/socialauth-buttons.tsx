"use client"

import { Button } from '@/components/ui/button'
import { FcGoogle as GoogleIcon } from 'react-icons/fc'
import { FaGithub as GithubIcon } from 'react-icons/fa'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useState } from 'react'

const SocialAuthButtons = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    const supabase = createClient();

    const URL = `${window.location.origin}/api/auth/callback`

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: URL,
      }
    })

    if (error) {
      toast.error('Error during Google OAuth sign-in');
    } else {
      toast.success('Redirecting to Google for authentication...');
    }

    setIsLoading(false);
  }

  const signInWithGithub = async () => {
    const supabase = await createClient();
    const URL = `${window.location.origin}/api/auth/callback`

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: URL,
      }
    })  

    if (error) {
      toast.error('Error during GitHub OAuth sign-in');
    } else {
      toast.success('Redirecting to GitHub for authentication...');
    }

    setIsLoading(false);
  }

  return (
    <>
      <Button variant="outline" className="w-full gap-2" onClick={signInWithGoogle}>
          <GoogleIcon /> Continue with Google
      </Button>
      <Button variant="outline" className="w-full gap-2 mt-2" onClick={signInWithGithub}>
        <GithubIcon /> Continue with GitHub
      </Button>
    </>
  )
}

export default SocialAuthButtons
