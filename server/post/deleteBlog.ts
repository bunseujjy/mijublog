import { useToast } from "~/components/ui/toast";

export async function deleteBlog(post_id: string) {
    try {
        const client = useSupabaseClient();
        const {toast} = useToast()
        const {data, error} = await client.from("blog_posts").delete().eq("id", post_id)

        if(error) {
            throw new Error(error.message)
        }
        toast({description: 'Blog deleted successfully'});
        navigateTo('/')
        return data || []
    } catch (error: any) {
        console.error(error.message)
    }
}