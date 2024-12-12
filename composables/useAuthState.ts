import { useSupabaseUser } from '#imports'

export const useAuthState = () => {
  const user = useSupabaseUser()
  
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const setLoading = (value: boolean) => {
    isLoading.value = value
  }

  const setError = (value: string | null) => {
    error.value = value
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    setLoading,
    setError
  }
}