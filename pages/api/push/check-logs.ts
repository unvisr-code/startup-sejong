import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { notificationId } = req.query;

    console.log('🔍 Checking delivery logs for notification:', notificationId);

    // Get all delivery logs for this notification
    const { data: deliveryLogs, error: logError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*')
      .eq('notification_id', notificationId)
      .order('sent_at', { ascending: false });

    if (logError) {
      return res.status(500).json({
        error: 'Failed to fetch delivery logs',
        details: logError.message
      });
    }

    // Check if any have click tracking data
    const clickTracked = deliveryLogs?.filter(log => 
      log.error_message && log.error_message.startsWith('OPENED_AT:')
    ) || [];

    res.status(200).json({
      success: true,
      notificationId: notificationId,
      totalLogs: deliveryLogs?.length || 0,
      clickTrackedCount: clickTracked.length,
      deliveryLogs: deliveryLogs || [],
      clickTracked: clickTracked,
      openRate: deliveryLogs?.length > 0 ? Math.round((clickTracked.length / deliveryLogs.length) * 100) : 0
    });

  } catch (error: any) {
    console.error('Check logs error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}