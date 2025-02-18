import { createClient } from '@supabase/supabase-js';
import type { BlogData } from '~/lib/type';

export default defineSitemapEventHandler(async () => {
  try {
    const config = useRuntimeConfig()
    const supabase = createClient(config.public.SUPABASE_URL, config.public.SUPABASE_ANON_KEY);
    const { data: users }  = await supabase.auth.admin.listUsers();
    
    // Get all posts
    const getAllPost = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('publish_date', { ascending: false })
  
        if (supabaseError) {
          throw supabaseError
        }
        
        return data
      } catch (e) {
        console.error('Error fetching posts:', e)
        return []
      }
    }


    const [posts] = await Promise.all([
      getAllPost(),
    ]);

    // Define your base URL from runtime config
    const baseUrl = useRuntimeConfig().public.baseURL || 'http://localhost:3000';

    // Map posts to sitemap entries
    return posts.map((post: BlogData) => {
      // Find the author of the post
      const user = users.users.find((user) => user.id === post.author_id);

      return {
        loc: `${baseUrl}/post/@${user?.user_metadata?.username}/${post.id}`,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: post.updated_at || post.publish_date,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap URLs:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});