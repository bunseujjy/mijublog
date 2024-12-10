import { useToast } from '~/components/ui/toast';
import type { Database } from '~/supabase';

export const usePostManagement = () => {
  const client = useSupabaseClient<Database>();
  const {toast} = useToast();
  const tags = ref<string[]>([]);
  const categories_id = ref();
  const router = useRouter();

  const savePost = async (title: string, subtitle: string, contentHtml: string, tags: string[], currentUser: any) => {
    try {
      const { data, error } = await client
        .from('blog_posts')
        .insert([{
          slug: title.toLowerCase().replace(/\s+/g, '-').slice(0, 100),
          title,
          subtitle,
          content: contentHtml,
          author_id: currentUser.id,
          tags,
          status: 'drafted',
        }]).select("*");

      if (error) throw error;
      if(data && data.length > 0) {
        const postId = data[0].id
        const username = currentUser?.user_metadata?.username;
        router.push(`/post/@${encodeURIComponent(username)}/${postId}/edit?success=true`);
      }
    } catch (error) {
      toast({description: "Error saving the post."});
      throw error;
    }
  };

  const manageTags = async (tags: string[]) => {
    for (const tag of tags) {
      const slug = tag.toLowerCase().replace(/\s+/g, "-");
      const { data: existingCategory } = await client
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (existingCategory) {
        await client
          .from("categories")
          .update({ post_length: existingCategory.post_length! + 1})
          .eq("id", existingCategory.id);
      } else {
        const { data: newCategory } = await client
          .from("categories")
          .insert({
            name: tag,
            slug,
            post_length: 1,
          })
          .select()
          .single();

        if (newCategory) {
          categories_id.value = newCategory.id;
        }
      }
    }

    if (categories_id.value) {
      await client
        .from("post_categories")
        .insert({
          post_id: categories_id.value,
          category_id: categories_id.value,
        });
    }
  };

  return {
    savePost,
    manageTags,
    tags,
    categories_id
  };
};
