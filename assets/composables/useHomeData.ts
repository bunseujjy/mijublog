import type { BlogData, Category } from '~/lib/type'
import { getCategories } from '~/server/categories/getCategories'
import { getRecentPost } from '~/server/post/getRecentBlog'

export const useHomeData = () => {
  const isLoading = ref<boolean>(true)
  const isError = ref<boolean>(false)
  const blog_db = ref<BlogData[]>([])
  const categories = ref<Category[]>([])

  const fetchHomeData = async () => {
    if (blog_db.value.length > 0) return // Don't fetch if data exists
    
    isLoading.value = true
    isError.value = false
    
    try {
      const [recentBlog, category] = await Promise.all([
        getRecentPost(),
        getCategories(),
      ])
      blog_db.value = recentBlog || []
      categories.value = category || []
    } catch (err) {
      console.error('Error fetching data:', err)
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  const refreshData = async () => {
    blog_db.value = []
    await fetchHomeData()
  }

  return {
    isLoading,
    isError,
    blog_db,
    categories,
    fetchHomeData,
    refreshData
  }
}