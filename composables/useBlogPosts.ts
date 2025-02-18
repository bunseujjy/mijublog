import type { User } from '@supabase/supabase-js';
import type { BlogData, BlogPostUpdate } from '~/lib/type';
import { getRecentPost } from '~/server/post/getRecentBlog';

export function useBlogPosts() {
  const supabase = useSupabaseClient()
  const blog_db = useState<BlogData[]>('blog_db', () => []);
  const all_post = useState<BlogData[]>('all_post', () => [])
  const users = ref<User[]>([]);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);
  const fetchPosts = async () => {
    try {
      isLoading.value = true;
      const [posts, usersList] = await Promise.all([
        getRecentPost(),
        getAllUser()
      ]);
      
      blog_db.value = posts || [];
      users.value = usersList || [];
    } catch (e) {
      error.value = e as Error;
    } finally {
      isLoading.value = false;
    }
  };

  const getBlogPostByID = async (id: string): Promise<BlogData | null> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  };

  const updateBlogPost = async (id: string, updates: BlogPostUpdate) => {
    const { error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const getAllPost = async () => {
    try {
      isLoading.value = true
      const { data, error: supabaseError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('publish_date', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      if (data) {
        all_post.value = data
      }
      
      return data
    } catch (e) {
      console.error('Error fetching posts:', e)
      error.value = e as Error
      return []
    } finally {
      isLoading.value = false
    }
  }

  const findPostAuthor = (authorId: string) => {
    return users.value.find(user => user.id === authorId);
  };

  const filterPostsByStatus = (authorId: string, status: 'draft' | 'posted') => {
    return blog_db.value.filter(post => 
      post.author_id === authorId && post.status === status
    );
  };

  return {
    blog_db,
    getBlogPostByID,
    users,
    isLoading,
    error,
    fetchPosts,
    findPostAuthor,
    filterPostsByStatus,
    updateBlogPost,
    deleteBlogPost,
    getAllPost,
    all_post,
  };
}