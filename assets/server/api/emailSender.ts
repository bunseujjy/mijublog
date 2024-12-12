import sendMail from '../../utils/sendMail'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    await sendMail({
      user_email: body.user_email,
      subject: `Report Comment by ${body.user_email}`,
      html: body.html
    })
    
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Error sending email:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to send email'
    })
  }
});