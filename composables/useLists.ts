import type { Lists, SavedPosts } from "~/lib/type";
import { getSavedPost } from "~/server/post/getSavedPost";
import type { Database } from "~/supabase";

export const useLists = () => {
    const supabase = useSupabaseClient<Database>();
    const list_db = ref<Lists | null>(null)
    const all_lists = ref<Lists[]>([])
    const page = ref(1)
    const pageSize = 5
    const isScrolling = ref(false);
    const isLoading = ref(false)
    const saved_posts = ref<SavedPosts[]>([])

    const getAllLists = async () => {
      const {data, error} = await supabase.from('user_lists').select('*')
        if ( error ) {
            throw new Error(error.message)
        } 
        all_lists.value = data || []
    }

    const getListsBySlug = async (slug: string | string[]) => {
        const {data, error} = await supabase.from('user_lists').select('*').eq('slug', slug)
        if ( error ) {
            throw new Error(error.message)
        } 
        list_db.value = data?.length > 0 ? data[0] : null
    }

    const loadMoreListItems = () => {
      if (page.value * pageSize < saved_posts.value.length) {
        isScrolling.value = true;
        setTimeout(() => {
          page.value++;
          isScrolling.value = false;
        }, 1500); // Simulate loading delay
      }
    };

    
    onMounted(async () => {
        const saved_data = await getSavedPost();
        saved_posts.value = saved_data || []
    })

    return {
        all_lists,
        getAllLists,
        list_db,
        getListsBySlug,
        saved_posts,
        loadMoreListItems,
        isLoading,
        isScrolling,
    }
}