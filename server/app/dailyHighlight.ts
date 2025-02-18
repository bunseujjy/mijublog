import sendMailForBlog from '../../utils/sendMailForBlog'
import type { EmailOptions, EmailResult, EmailSummary } from './types/emailTypes'
export async function dailyHighlight(emailTasks: EmailOptions[]): Promise<EmailSummary> {
  console.log(`Processing ${emailTasks.length} email tasks`)
  
  const results: EmailResult[] = []

  // Process emails sequentially to avoid overwhelming the SMTP server
  for (const task of emailTasks) {
    try {
      console.log(`Sending email to: ${task.user_email}`)
      await sendMailForBlog(task)
      results.push({
        success: true,
        recipient: task.user_email
      })
      console.log(`Successfully sent email to: ${task.user_email}`)
    } catch (error) {
      console.error(`Failed to send email to ${task.user_email}:`, error)
      results.push({
        success: false,
        recipient: task.user_email,
        error: error instanceof Error ? error.message : String(error)
      })
    }
    
    // Add a small delay between emails to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const summary = {
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }

  console.log('Email sending summary:', {
    total: emailTasks.length,
    successful: summary.successful,
    failed: summary.failed
  })

  return summary
}