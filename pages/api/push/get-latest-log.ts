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
    // Get the latest 5 delivery log entries
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('notification_id, subscription_id, status, sent_at, opened_at')
      .order('sent_at', { ascending: false })
      .limit(5);

    if (logsError) {
      return res.status(500).json({
        error: 'Failed to fetch delivery logs',
        details: logsError.message
      });
    }

    // Also get the latest notification
    const { data: latestNotification, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    res.status(200).json({
      success: true,
      latestLogs: logs || [],
      latestNotification: latestNotification,
      message: 'Latest delivery logs retrieved',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching latest logs:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}