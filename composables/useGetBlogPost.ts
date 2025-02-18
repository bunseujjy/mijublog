import { getSupabaseClient } from '../utils/supabase'
import type { BlogData } from '~/lib/type'
import { formatISO, startOfDay, endOfDay } from 'date-fns'

export async function useGetBlogPost(): Promise<BlogData[]> {
  try {
    const client = getSupabaseClient()

    // Get today's start and end of day in ISO format (UTC)
    const todayStart = formatISO(startOfDay(new Date())) // Start of today
    const todayEnd = formatISO(endOfDay(new Date()))     // End of today

    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .gte('publish_date', todayStart) // Greater than or equal to start of today
      .lt('publish_date', todayEnd)    // Less than end of today

    if (error) {
      console.error('Error fetching blog posts:', error.message)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return []
  }
}
