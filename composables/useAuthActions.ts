import { useSupabaseClient } from '#imports'
import { useToast } from '~/components/ui/toast'
import { useAuthState } from './useAuthState'

export const useAuthActions = () => {
  const client = useSupabaseClient()
  const { toast } = useToast()
  const { setLoading, setError } = useAuthState()

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error

      toast({ description: 'Sign in successful!' })
      return true
    } catch (err: any) {
      setError(err.message)
      toast({ 
        description: 'Incorrect email or password. Please try again.', 
        variant: 'destructive' 
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await client.auth.signOut()
      if (error) throw error

      toast({ description: 'Signed out successfully' })
      return true
    } catch (err: any) {
      setError(err.message)
      toast({ 
        description: 'Error signing out', 
        variant: 'destructive' 
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    signIn,
    signOut
  }
}