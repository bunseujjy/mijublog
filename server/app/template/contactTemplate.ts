import type { User } from "@supabase/supabase-js";
import type { ContactFormData } from "../types/emailTypes";

export default function ContactEmailTemplate(
  contactData: ContactFormData,
  platformName: string,
  recipientDetails: User | null
) {
  const formattedDate = () => {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <title>${platformName} Contact Form Submission</title>
      <style>
        @media (max-width: 600px) {
          .sm-w-full { width: 100% !important; }
          .sm-px-16 { padding-left: 16px !important; padding-right: 16px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #ffffff;">
      <div role="article" aria-roledescription="email" aria-label="Contact Form Submission" lang="en">
        <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <table class="sm-w-full" style="width: 600px; margin: 0 auto;" cellpadding="0" cellspacing="0" role="presentation">
                <!-- Header -->
                <tr>
                  <td style="padding: 24px 0 0;">
                    <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <h1 style="font-family: charter, Georgia, Cambria, 'Times New Roman', Times, serif;
                                   font-size: 32px; line-height: 1.2; font-weight: 400; text-align: left;
                                   letter-spacing: -0.015em; margin: 0; color: rgba(0,0,0,0.84);">
                            New Contact Form Submission
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e6e6e6;">
                          <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                   font-size: 14px; font-weight: 500;
                                   letter-spacing: 0.05em; margin: 0; color: rgba(0,0,0,0.54);">
                            Received on ${formattedDate()}
                          </h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contact Details -->
                <tr>
                  <td class="sm-px-16">
                    <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding: 20px 0; border-bottom: 1px solid #e6e6e6;">
                          <table style="width: 100%;" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                         font-size: 16px; line-height: 24px; margin: 0; color: rgba(0,0,0,0.84);">
                                  <strong>From:</strong> ${contactData.name} (${contactData.email})
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 16px;">
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                         font-size: 16px; line-height: 24px; margin: 0; color: rgba(0,0,0,0.84);">
                                  <strong>Subject:</strong> ${contactData.subject}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                         font-size: 16px; line-height: 24px; margin: 0; color: rgba(0,0,0,0.84);">
                                  <strong>Message:</strong>
                                </p>
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                         font-size: 16px; line-height: 24px; margin: 8px 0 0; color: rgba(0,0,0,0.84);">
                                  ${contactData.message.replace(/\n/g, '<br>')}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 40px 0; text-align: center;">
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                             font-size: 14px; color: rgba(0,0,0,0.54); margin: 0;">
                      This message was sent from the contact form on ${platformName}.
                    </p>
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                             font-size: 14px; color: rgba(0,0,0,0.54); margin: 8px 0 0;">
                      To respond, please reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  return { html };
}

