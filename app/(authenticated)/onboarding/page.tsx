'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Page() {
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        setFirstName(error.message)
        return;
      }

      setFirstName(user?.user_metadata?.first_name ?? 'Guest')
    }

    fetchUser()
  }, [])

  return (
    <div>
      <p>Welcome, this is the onboarding page.</p>
      <p>User: {firstName ?? 'Loading...'}</p>
    </div>
  )
}
