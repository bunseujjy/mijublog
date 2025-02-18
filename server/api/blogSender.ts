import sendMailForBlog from '../../utils/sendMailForBlog'
import {checkNotificationPreferences} from '../../utils/checkNotificationPreferences';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)  
  const preferences = await checkNotificationPreferences(body.userId)

  if (!preferences.emailEnabled || !preferences.pushEnabled) {
    return {
      success: false,
      recipient: body.user_email,
      error: 'Email notifications are disabled for this user'
    }
  }
  
  if (!body.user_email) {
    throw createError({
      statusCode: 400,
      message: 'User email is required'
    })
  }

  try {
    await sendMailForBlog({
      user_email: body.user_email,
      subject: `New Blog Post: ${body.title}`,
      html: body.html
    })
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      recipient: body.user_email 
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to send email to ${body.user_email}`
    })
  }
});