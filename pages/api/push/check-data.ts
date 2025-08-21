import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔍 Checking push notification data...');

    // Get sample subscription
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .limit(1);

    // Get sample delivery logs
    const { data: deliveryLogs, error: logError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(5);

    // Get sample notification
    const { data: notifications, error: notError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .limit(1);

    res.status(200).json({
      success: true,
      subscriptions: subscriptions || [],
      subscriptionCount: subscriptions?.length || 0,
      deliveryLogs: deliveryLogs || [],
      deliveryLogCount: deliveryLogs?.length || 0,
      notifications: notifications || [],
      notificationCount: notifications?.length || 0,
      errors: {
        subscriptions: subError?.message,
        deliveryLogs: logError?.message,
        notifications: notError?.message
      }
    });

  } catch (error: any) {
    console.error('Check data error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}