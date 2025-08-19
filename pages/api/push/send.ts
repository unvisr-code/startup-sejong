import type { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import { supabase } from '../../../lib/supabase';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@sejong.ac.kr',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, icon, url, tag, requireInteraction, adminEmail } = req.body as PushNotificationData & { adminEmail?: string };

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Get all active subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ 
        message: 'No active subscriptions found',
        sent: 0,
        errors: 0
      });
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        title,
        body,
        icon: icon || '/icons/icon-192x192.png',
        url: url || '/',
        tag: tag || 'admin-notification',
        require_interaction: requireInteraction || false,
        admin_email: adminEmail,
        sent_count: subscriptions.length
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification record:', notificationError);
      return res.status(500).json({ error: 'Failed to create notification record' });
    }

    // Prepare push payload
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      url: url || '/',
      tag: tag || 'admin-notification',
      requireInteraction: requireInteraction || false,
      primaryKey: notification.id
    });

    // Send push notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        
        // Log successful delivery
        await supabase
          .from('notification_delivery_log')
          .insert({
            notification_id: notification.id,
            subscription_id: subscription.id,
            status: 'sent'
          });

        return { success: true, subscriptionId: subscription.id };
      } catch (error: any) {
        console.error('Push send error:', error);
        
        // Log failed delivery
        await supabase
          .from('notification_delivery_log')
          .insert({
            notification_id: notification.id,
            subscription_id: subscription.id,
            status: 'failed',
            error_message: error.message
          });

        // Check if subscription is invalid and mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id);
        }

        return { success: false, subscriptionId: subscription.id, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    // Update notification stats
    await supabase
      .from('notifications')
      .update({
        success_count: successCount,
        error_count: errorCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', notification.id);

    res.status(200).json({
      message: 'Push notifications sent',
      sent: successCount,
      errors: errorCount,
      total: subscriptions.length,
      notificationId: notification.id
    });

  } catch (error) {
    console.error('Push API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}