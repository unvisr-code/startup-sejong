import type { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Validate VAPID configuration
const validateVapidConfig = () => {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL;

  console.log('🔍 VAPID Config Check:');
  console.log(`  Public Key: ${publicKey ? `${publicKey.substring(0, 20)}...` : 'MISSING'}`);
  console.log(`  Private Key: ${privateKey ? `${privateKey.substring(0, 10)}... (${privateKey.length} chars)` : 'MISSING'}`);
  console.log(`  Email: ${email || 'MISSING'}`);

  if (!publicKey || publicKey.length < 20) {
    throw new Error(`VAPID_PUBLIC_KEY is missing or invalid (length: ${publicKey?.length || 0})`);
  }
  if (!privateKey || privateKey.length < 20) {
    throw new Error(`VAPID_PRIVATE_KEY is missing or invalid (length: ${privateKey?.length || 0})`);
  }
  if (!email) {
    throw new Error('VAPID_EMAIL is missing');
  }
  if (!email.startsWith('mailto:')) {
    console.warn('⚠️ VAPID_EMAIL should start with "mailto:" - fixing automatically');
    return { publicKey, privateKey, email: `mailto:${email}` };
  }

  return { publicKey, privateKey, email };
};

// Configure web-push with VAPID keys
try {
  const { publicKey, privateKey, email } = validateVapidConfig();
  webpush.setVapidDetails(email, publicKey, privateKey);
  console.log('✅ VAPID configuration successful');
  console.log(`  Email: ${email}`);
} catch (error: any) {
  console.error('❌ VAPID configuration failed:', error.message);
  console.error('  Please check your environment variables');
}

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  ip_address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate VAPID configuration first
    try {
      validateVapidConfig();
    } catch (vapidError: any) {
      console.error('VAPID validation failed:', vapidError);
      return res.status(500).json({ 
        error: 'Server configuration error', 
        details: vapidError.message,
        type: 'VAPID_CONFIG_ERROR'
      });
    }

    const { title, body, icon, url, tag, requireInteraction, adminEmail } = req.body as PushNotificationData & { adminEmail?: string };

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    console.log('\n🔔 ===========================================');
    console.log('🔔 Push Notification Request');
    console.log('🔔 ===========================================');
    console.log('📝 Content:', { title, body, url, adminEmail });
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

    // Get all active subscriptions using Admin client to bypass RLS
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);
    
    console.log('Active subscriptions found:', subscriptions?.length || 0);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      
      // Check if it's a table not found error
      if (fetchError.message.includes('relation') && fetchError.message.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Database tables not found', 
          details: 'Push subscription tables need to be created in Supabase',
          type: 'DATABASE_TABLE_ERROR',
          sqlFile: 'Run database/push_notifications.sql in Supabase SQL Editor'
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to fetch subscriptions',
        details: fetchError.message,
        type: 'DATABASE_ERROR'
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ 
        message: 'No active subscriptions found',
        sent: 0,
        errors: 0
      });
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabaseAdmin
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
    const sendPromises = subscriptions.map(async (subscription: PushSubscriptionRecord) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        console.log(`📤 Sending to subscription ${subscription.id}...`);
        console.log(`  Endpoint: ${subscription.endpoint.substring(0, 60)}...`);
        
        const result = await webpush.sendNotification(pushSubscription, payload);
        console.log(`✅ Successfully sent to ${subscription.id}`);
        console.log(`  Status: ${result.statusCode}`);
        console.log(`  Headers:`, result.headers);
        
        // Log successful delivery (with error handling)
        try {
          await supabaseAdmin
            .from('notification_delivery_log')
            .insert({
              notification_id: notification.id,
              subscription_id: subscription.id,
              status: 'sent'
            });
        } catch (logError) {
          console.warn('Failed to log successful delivery:', logError);
          // Continue without failing the main operation
        }

        return { success: true, subscriptionId: subscription.id };
      } catch (error: any) {
        console.error(`❌ Failed to send to ${subscription.id}:`, error.message);
        console.error('  Error details:', {
          statusCode: error.statusCode,
          headers: error.headers,
          body: error.body,
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });
        
        // Log specific error types
        if (error.statusCode === 401) {
          console.error('  🔐 Authentication error - check VAPID keys');
        } else if (error.statusCode === 410) {
          console.error('  🗑️ Subscription expired - will mark as inactive');
        } else if (error.statusCode === 404) {
          console.error('  ❓ Subscription not found - endpoint invalid');
        } else if (error.statusCode === 400) {
          console.error('  ⚠️ Bad request - check payload format');
        }
        
        // Log failed delivery (with error handling)
        try {
          await supabaseAdmin
            .from('notification_delivery_log')
            .insert({
              notification_id: notification.id,
              subscription_id: subscription.id,
              status: 'failed',
              error_message: error.message
            });
        } catch (logError) {
          console.warn('Failed to log failed delivery:', logError);
          // Continue without failing the main operation
        }

        // Check if subscription is invalid and mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Marking subscription ${subscription.id} as inactive (${error.statusCode})`);
          await supabaseAdmin
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
    
    console.log('\n📊 ===========================================');
    console.log('📊 Push Notification Results');
    console.log('📊 ===========================================');
    console.log(`✅ Success: ${successCount}/${subscriptions.length}`);
    console.log(`❌ Failed: ${errorCount}/${subscriptions.length}`);
    console.log(`📝 Success Rate: ${subscriptions.length > 0 ? Math.round((successCount / subscriptions.length) * 100) : 0}%`);
    
    // Log failed subscription IDs for debugging
    const failedSubs = results.filter(r => !r.success);
    if (failedSubs.length > 0) {
      console.log('\n❌ Failed Subscriptions:');
      failedSubs.forEach(sub => {
        console.log(`  - ${sub.subscriptionId}: ${sub.error}`);
      });
    }
    console.log('===========================================\n');

    // Update notification stats
    await supabaseAdmin
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

  } catch (error: any) {
    console.error('Push API error:', error);
    
    // Provide detailed error information
    const errorResponse = {
      error: 'Internal server error',
      details: error.message || 'Unknown error occurred',
      type: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };

    // Check for specific error types
    if (error.message?.includes('VAPID')) {
      errorResponse.type = 'VAPID_ERROR';
    } else if (error.message?.includes('database') || error.message?.includes('supabase')) {
      errorResponse.type = 'DATABASE_ERROR';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorResponse.type = 'NETWORK_ERROR';
    }

    res.status(500).json(errorResponse);
  }
}