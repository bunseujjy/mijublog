import type { Database } from '~/supabase';
import generateEmailTemplate from './template/reportTemplate';

export default async function emailReportingPost(
    post_id: string,
    reporter_id: string,
    report_reason: string,
    report_details: string,
    user_email: string,
    username: string,
    topic: string | null,
    user_id: string,
) {
    const client = useSupabaseClient<Database>();
    const emailContent = generateEmailTemplate(post_id, report_reason, report_details, user_email, username, topic!, 'Post');

    try {
        const { error } = await client.from('blog_post_reports').insert({
            post_id,
            reporter_id,
            report_reason,
            report_details,
        });

        if (error) throw error;

        // Send email via API route
        const mailResponse = await $fetch('/api/emailSender', {
            method: 'POST',
            body: {
                user_email,
                html: emailContent.html,
                user_id,
            },
        });

        return { success: true, data: mailResponse };
    } catch (error) {
        console.error('Error in emailReporting:', error);
        throw error;
    }
}