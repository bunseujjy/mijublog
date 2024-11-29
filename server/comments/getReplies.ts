
export const getReplies = async (commentId: string) => {
  if (!commentId) return [];
  
  try {
    const client = useSupabaseClient()
    const { data: replies, error } = await client
      .from('replies')
      .select('*')
      .eq('comment_id', commentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return [];
    }

    return replies || [];
  } catch (error) {
    console.error('Error in getReplies:', error);
    return [];
  }
}