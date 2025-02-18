export type EmailTemplate = { html: string, text: string }
export interface EmailOptions {
    user_email: string;
    html: string;
    subject?: string;
  }
  
  export interface EmailResult {
    success: boolean;
    recipient?: string;
    error?: any;
  }
  
  export interface EmailSummary {
    successful: number;
    failed: number;
    results: any[];
  }

  
  export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
  