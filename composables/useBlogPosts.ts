import type { User } from '@supabase/supabase-js';
import type { BlogData } from '~/lib/type';
import { getRecentPost } from '~/server/post/getRecentBlog';

export function useBlogPosts() {
  const blog_db = ref<BlogData[]>([]);
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
    users,
    isLoading,
    error,
    fetchPosts,
    findPostAuthor,
    filterPostsByStatus
  };
}