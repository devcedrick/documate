import { Button } from '@/components/ui/button'
import { FcGoogle as GoogleIcon } from 'react-icons/fc'
import { FaGithub as GithubIcon } from 'react-icons/fa'

const SocialAuthButtons = () => {
  return (
    <>
      <Button variant="outline" className="w-full gap-2">
          <GoogleIcon /> Continue with Google
      </Button>
      <Button variant="outline" className="w-full gap-2 mt-2">
        <GithubIcon /> Continue with GitHub
      </Button>
    </>
  )
}

export default SocialAuthButtons
