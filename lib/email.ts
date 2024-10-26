import mailgun from 'mailgun-js';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_FROM_EMAIL) {
    console.error('Missing env vars:', {
      MAILGUN_API_KEY: !!process.env.MAILGUN_API_KEY,
      MAILGUN_DOMAIN: !!process.env.MAILGUN_DOMAIN,
      MAILGUN_FROM_EMAIL: !!process.env.MAILGUN_FROM_EMAIL
    });
    throw new Error('Mailgun configuration is missing');
  }

  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    host: 'api.eu.mailgun.net'
  });

  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to,
    subject,
    text,
    html
  };

  try {
    const response = await mg.messages().send(data);
    console.log('Email sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
