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
    // Get a sample delivery log entry with 'sent' status
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('notification_id, subscription_id, status')
      .eq('status', 'sent')
      .limit(3);

    if (logsError) {
      return res.status(500).json({
        error: 'Failed to fetch delivery logs',
        details: logsError.message
      });
    }

    // Also get total count of logs
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*', { count: 'exact', head: true });

    // Get count by status
    const { count: sentCount, error: sentError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    const { count: openedCount, error: openedError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'opened');

    res.status(200).json({
      success: true,
      sampleLogs: logs || [],
      logCounts: {
        total: totalCount || 0,
        sent: sentCount || 0,
        opened: openedCount || 0
      },
      message: 'Sample delivery logs retrieved',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching sample logs:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}