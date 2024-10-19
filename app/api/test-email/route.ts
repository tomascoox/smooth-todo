import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    console.log('Starting email test...');
    const info = await sendEmail({
      to: 'tomas@joox.se',  // Replace with your actual email address
      subject: 'Test Email from Smooth Todo',
      text: 'This is a test email from your Smooth Todo application.',
      html: '<p>This is a test email from your Smooth Todo application.</p>',
    });
    console.log('Email sent successfully:', info);
    return NextResponse.json({ message: 'Test email sent successfully', info });
  } catch (error: any) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email', 
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
