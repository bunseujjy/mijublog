import type { BlogData } from '~/lib/type'

export const useBlogPagination = (blogs: BlogData[]) => {
  const page = ref(1)
  const pageSize = 5
  const isScrolling = ref(false);
  const isLoading = ref(false)
  const searchQuery = useState('searchQuery', () => '')
  const selectedCategory = useState('selectedCategory', () => '')

  const filteredBlogs = computed(() => {
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
        (selectedCategory.value === '' || blog.tags.includes(selectedCategory.value))
    ).filter(blog => blog.visibility !== 'private')
  })

  const paginatedBlogs = computed(() => {
    return filteredBlogs.value.slice(0, page.value * pageSize)
  })

  const loadMoreBlogs = () => {
    if (page.value * pageSize < filteredBlogs.value.length) {
      isScrolling.value = true;
      setTimeout(() => {
        page.value++;
        isScrolling.value = false;
      }, 1500); // Simulate loading delay
    }
  };

  console.log(paginatedBlogs)
  return {
    page,
    isLoading,
    isScrolling,
    searchQuery,
    selectedCategory,
    filteredBlogs,
    paginatedBlogs,
    loadMoreBlogs
  }
}