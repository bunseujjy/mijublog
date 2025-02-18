import { ref } from 'vue'

// Create a singleton state that persists across component instances
const monthlyVisitors = ref<number>(0)
const isLoading = ref(false)
const error = ref<Error | null>(null)

export const useAnalytics = () => {
  const fetchMonthlyVisitors = async () => {
    if (monthlyVisitors.value > 0) return // Don't fetch if we already have data
    
    isLoading.value = true
    error.value = null
    
    try {
      // Uncomment when API is ready
      const response = await $fetch<{monthlyVisitors: number}>('/api/getAnalytics')
      monthlyVisitors.value = response.monthlyVisitors
    } catch (err) {
      console.error('Failed to fetch monthly visitors:', err)
      error.value = err instanceof Error ? err : new Error('Unknown error')
      monthlyVisitors.value = 0
    } finally {
      isLoading.value = false
    }
  }

  return {
    monthlyVisitors,
    isLoading,
    error,
    fetchMonthlyVisitors
  }
}