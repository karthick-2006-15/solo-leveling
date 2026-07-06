import webpush from 'web-push';
import { Resend } from 'resend';
import NotificationSettings from '../models/NotificationSettings';

// Configure Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@sololeveling.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys are missing. Web Push will not work.');
}

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_test_key');

export const sendPushNotification = async (userId: string, payload: { title: string; body: string; url?: string }): Promise<void> => {
  try {
    const settings = await NotificationSettings.findOne({ userId });
    
    if (!settings || !settings.push.enabled || !settings.pushSubscription) {
      return; // Push disabled or no subscription
    }

    await webpush.sendNotification(
      settings.pushSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        data: { url: payload.url || '/' }
      })
    );
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or is invalid
      console.log(`Push subscription expired for user ${userId}. Disabling push.`);
      await NotificationSettings.updateOne(
        { userId },
        { 
          $set: { 'push.enabled': false, pushSubscription: null }
        }
      );
    } else {
      console.error(`Error sending push notification to user ${userId}:`, error);
    }
  }
};

export const sendEmail = async (toEmail: string, subject: string, html: string): Promise<void> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY missing. Skipping email send.');
      return;
    }
    
    await resend.emails.send({
      from: 'Solo Leveling System <system@sololeveling.com>',
      to: toEmail,
      subject,
      html
    });
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
  }
};
