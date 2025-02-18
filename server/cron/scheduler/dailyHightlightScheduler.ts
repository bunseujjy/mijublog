import { Cron } from 'croner'
import { dailyHighlight } from '~/server/app/dailyHighlight'
import BlogHighlightEmailTemplate from '~/server/app/template/dailyBlogTemplate'
import type { EmailOptions } from '~/server/app/types/emailTypes'

export function createDailyHighlightScheduler(cronExpression: string) {
  console.log('Daily highlight scheduler initialized')
  
  return new Cron(cronExpression, { timezone: "UTC" }, async () => {
    console.log('Starting daily highlight email sending...', new Date().toISOString())
    
    try {
      const [blogPosts, users] = await Promise.all([
        useGetBlogPost(),
        getAllUser()
      ])

      if (!blogPosts?.length || !users?.length) {
        console.log('No blog posts or users found')
        return
      }

      const emailTasks: EmailOptions[] = users.map(user => ({
        user_email: user.user_metadata?.email,
        subject: `Daily Highlight: ${blogPosts[0].title}`,
        html: BlogHighlightEmailTemplate(blogPosts, 'MijuBlog', user).html
      }))

      await dailyHighlight(emailTasks)
    } catch (error) {
      console.error('Daily highlight scheduler failed:', error)
    }
  })
}