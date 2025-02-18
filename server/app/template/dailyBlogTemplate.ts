import type { BlogData } from "~/lib/type";
import type { User } from "@supabase/supabase-js";

export default function BlogHighlightEmailTemplate(blogPosts: BlogData[], platformName: string, authorDetails: User) {
  const formattedDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const generateBlogPostHTML = (blog: BlogData) => `
    <tr>
      <td style="padding: 20px 0; border-bottom: 1px solid #e6e6e6;">
        <table style="width: 100%;" cellpadding="0" cellspacing="0">
          <!-- Author Info -->
          <tr>
            <td style="padding-bottom: 16px;">
              <table style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table style="width: auto;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 8px;">
                          <img src="${authorDetails?.user_metadata?.profile_url || 'https://via.placeholder.com/24'}" 
                               alt="${authorDetails?.user_metadata?.username}" 
                               style="width: 24px; height: 24px; border-radius: 50%;">
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                                     font-size: 14px; color: rgba(0,0,0,0.84);">
                            ${authorDetails?.user_metadata?.username} in ${blog.tags[0] || 'General'}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Article Content -->
          <tr>
            <td>
              <table style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Text Content -->
                  <td style="vertical-align: top; padding-right: 20px;">
                    <h2 style="font-family: charter, Georgia, Cambria, 'Times New Roman', Times, serif;
                             font-size: 22px; line-height: 28px; font-weight: 700; margin: 0 0 8px;
                             color: rgba(0,0,0,0.84);">
                      <a href="${`/post/@${authorDetails?.user_metadata?.username}/${blog.id}`}" 
                         style="color: inherit; text-decoration: none;">
                        ${blog.title}
                      </a>
                    </h2>
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                             font-size: 16px; line-height: 24px; color: rgba(0,0,0,0.54); margin: 0 0 12px;">
                      ${blog.subtitle}
                    </p>
                    <table style="width: auto;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                 font-size: 13px; color: rgba(0,0,0,0.54);">
                          ${blog.estimated_reading_time} min read · ${formattedDate(blog.publish_date)}
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Featured Image -->
                  <td style="vertical-align: top; width: 112px;">
                    <img src="${blog.featured_image_url || 'https://via.placeholder.com/112x112'}" 
                         alt="" 
                         style="width: 112px; height: 112px; object-fit: cover;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <title>${platformName} Daily Blog</title>
      <style>
        @media (max-width: 600px) {
          .sm-w-full { width: 100% !important; }
          .sm-px-16 { padding-left: 16px !important; padding-right: 16px !important; }
          .sm-hidden { display: none !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #ffffff;">
      <div role="article" aria-roledescription="email" aria-label="Daily Blog" lang="en">
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
                                   font-size: 42px; line-height: 1.2; font-weight: 400; text-align: left;
                                   letter-spacing: -0.015em; margin: 0; color: rgba(0,0,0,0.84);">
                            ${platformName} Daily Blog
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e6e6e6;">
                          <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                   font-size: 12px; font-weight: 500; text-transform: uppercase;
                                   letter-spacing: 0.05em; margin: 0; color: rgba(0,0,0,0.54);">
                            TODAY'S HIGHLIGHTS
                          </h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Blog Posts -->
                <tr>
                  <td class="sm-px-16">
                    <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                      ${blogPosts.map(generateBlogPostHTML).join('')}
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 40px 0; text-align: center;">
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                             font-size: 14px; color: rgba(0,0,0,0.54); margin: 0;">
                      Explore more blog of our site by clicking <a href="${process.env.APP_DOMAIN}/blog" style="color: #1a8917;">here</a>.
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

