export const getRecentPost = async () => {
    const client = useSupabaseClient()
    const {data, error} = await client.from("blog_posts").select("*")
    if(error) {
      console.error(error.message)
    }
    if (data) {
      // Make sure to push the posts to the blog_db array
    return data
    }
  }
  