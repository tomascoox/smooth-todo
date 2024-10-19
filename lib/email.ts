import mailgun from 'mailgun-js';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_FROM_EMAIL) {
    console.error('Mailgun configuration is missing');
    throw new Error('Mailgun configuration is missing');
  }

  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    host: 'api.eu.mailgun.net' // Add this line
  });

  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to,
    subject,
    text,
    html
  };

  try {
    console.log('Attempting to send email...');
    console.log('Mailgun configuration:', {
      apiKey: process.env.MAILGUN_API_KEY.substring(0, 5) + '...', // Log only the first 5 characters of the API key
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    });
    const response = await mg.messages().send(data);
    console.log('Email sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Failed to send email:', error);
    console.error('Error details:', error.message, error.stack);
    if (error.details) {
      console.error('Additional error details:', error.details);
    }
    throw error;
  }
}
