import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Calculating open rates for notifications...');

    // Get all notifications
    const { data: notifications, error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .select('id, title, sent_count')
      .order('created_at', { ascending: false })
      .limit(20);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return res.status(500).json({
        error: 'Failed to fetch notifications',
        details: notificationsError.message
      });
    }

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({
        success: true,
        openRates: {},
        message: 'No notifications found'
      });
    }

    console.log(`Found ${notifications.length} notifications`);

    // Calculate open rates for each notification
    const openRates: Record<string, number> = {};
    
    for (const notification of notifications) {
      try {
        // Count total deliveries for this notification
        const { count: totalDeliveries, error: totalError } = await supabaseAdmin
          .from('notification_delivery_log')
          .select('*', { count: 'exact', head: true })
          .eq('notification_id', notification.id);

        if (totalError) {
          console.warn(`Failed to get total deliveries for ${notification.id}:`, totalError);
          openRates[notification.id] = 0;
          continue;
        }

        // Count opened deliveries based on opened status
        const { count: openedDeliveries, error: openedError } = await supabaseAdmin
          .from('notification_delivery_log')
          .select('*', { count: 'exact', head: true })
          .eq('notification_id', notification.id)
          .eq('status', 'opened');

        if (openedError) {
          console.warn(`Failed to get opened deliveries for ${notification.id}:`, openedError);
          openRates[notification.id] = 0;
          continue;
        }

        // Calculate open rate percentage
        const totalCount = totalDeliveries || notification.sent_count || 0;
        const openedCount = openedDeliveries || 0;
        
        const openRate = totalCount > 0 ? Math.round((openedCount / totalCount) * 100) : 0;
        openRates[notification.id] = openRate;

        console.log(`Notification ${notification.title}: ${openedCount}/${totalCount} = ${openRate}%`);

      } catch (error) {
        console.warn(`Error calculating open rate for ${notification.id}:`, error);
        openRates[notification.id] = 0;
      }
    }

    console.log('📈 Open rates calculated:', openRates);

    // Add cache-busting headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({
      success: true,
      openRates: openRates,
      notificationCount: notifications.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Calculate open rates error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}