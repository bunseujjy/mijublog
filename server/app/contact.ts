import ContactEmailTemplate from './template/contactTemplate';
import type { ContactFormData } from './types/emailTypes';
import type { User } from '@supabase/supabase-js'
export default async function contact(
    contact: ContactFormData,
    user: User | null
) {
    const emailContent = ContactEmailTemplate(contact, 'MijuBlog', user);

    try {
        // const { error } = await client.from('comment_reports').insert({
        //     comment_id,
        //     reporter_id,
        //     report_reason,
        //     report_details,
        // });

        // if (error) throw error;

        // Send email via API route
        const mailResponse = await $fetch('/api/contactSender', {
            method: 'POST',
            body: {
                user_email: user?.user_metadata.email,
                html: emailContent.html,
                user_id: user?.id
            },
        });

        return { success: true, data: mailResponse };
    } catch (error) {
        console.error('Error in contact:', error);
        throw error;
    }
}