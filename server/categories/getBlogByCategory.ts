export const getBlogByCategories = async (tag: string) => {
    const client = useSupabaseClient()
    const {data, error} = await client.from("blog_posts").select("*").contains("tags", [tag])
    if(error) {
      console.error(error.message)
    }
    if (data) {
      // Make sure to push the posts to the blog_db array
      console.log(data)
    return data
    }
  }
  