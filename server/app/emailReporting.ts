import type { Database } from '~/supabase';
import generateEmailTemplate from './template/reportTemplate';

export default async function emailReporting(
    comment_id: string,
    reporter_id: string,
    report_reason: string,
    report_details: string,
    user_email: string,
    username: string,
    topic: string | null,
    user_id: string,
) {
    const client = useSupabaseClient<Database>();
    const emailContent = generateEmailTemplate(comment_id, report_reason, report_details, user_email, username, topic!, 'Comment');

    try {
        const { error } = await client.from('comment_reports').insert({
            comment_id,
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