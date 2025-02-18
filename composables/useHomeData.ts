import type {  Category } from '~/lib/type'
import { getCategories } from '~/server/categories/getCategories'
export const useHomeData = () => {
  const isLoading = ref<boolean>(true)
  const isError = ref<boolean>(false)
  const categories = ref<Category[]>([])

  const fetchHomeData = async () => {
    isLoading.value = true
    isError.value = false
    
    try {
      const [category] = await Promise.all([
        getCategories(),
      ])
      categories.value = category || []
    } catch (err) {
      console.error('Error fetching data:', err)
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const refreshData = async () => {
    await fetchHomeData()
  }

  return {
    isLoading,
    isError,
    categories,
    fetchHomeData,
    refreshData
  }
}