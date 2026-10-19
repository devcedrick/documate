'use client'
 
import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState 
} from "react"
import { createClient } from "@/utils/supabase/client"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  useCase: string
  responsePreference: string
  strictnessLevel: string
}
 
export const ChatContext = createContext<UserProfile | null>(null)
 
export default function ChatContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          setUser({
            id: profile.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            useCase: profile.use_case,
            responsePreference: profile.response_preference,
            strictnessLevel: profile.strictness_level,
          });
        }

      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-dvh">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading user...</span>
      </div>
    );
  }

  return (
    <ChatContext.Provider value={user}>
      {children}
    </ChatContext.Provider>
  )
}