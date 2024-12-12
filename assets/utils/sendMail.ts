import nodemailer from "nodemailer"

const config = useRuntimeConfig()

interface EmailOptions {
  user_email: string;
  html: string;
  subject?: string;
}

const sendMail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: Number(config.EMAIL_PORT) || 0,
    secure: false,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASSWORD
    },
    debug: true,
    logger: true
  })

  const mailOptions = {
    from: config.SMTP_USER,
    to: config.SMTP_USER,
    subject: options.subject || `Report Comment by ${options.user_email}`,
    html: options.html,
  }

  await transporter.sendMail(mailOptions)
}

export default sendMail;