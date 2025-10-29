import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { notificationId, subscriptionId } = req.body;

    console.log('🧪 Test tracking request:', { notificationId, subscriptionId });

    // Check if delivery log exists for this notification and subscription
    const { data: deliveryLog, error: logError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*')
      .eq('notification_id', notificationId)
      .eq('subscription_id', subscriptionId);

    if (logError) {
      return res.status(500).json({
        error: 'Failed to check delivery log',
        details: logError.message
      });
    }

    // If no delivery log exists, create one for testing
    if (!deliveryLog || deliveryLog.length === 0) {
      console.log('Creating test delivery log entry...');
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('notification_delivery_log')
        .insert({
          notification_id: notificationId,
          subscription_id: subscriptionId,
          status: 'sent'
        })
        .select();

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to create test delivery log',
          details: insertError.message
        });
      }

      console.log('✅ Created test delivery log:', insertData);
    }

    // Now try to track the open directly
    const trackResponse = await fetch(`http://localhost:4000/api/push/track-open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notificationId, subscriptionId })
    });

    const trackResult = await trackResponse.json();

    // Check updated delivery log
    const { data: updatedLog, error: updatedError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*')
      .eq('notification_id', notificationId)
      .eq('subscription_id', subscriptionId);

    res.status(200).json({
      success: true,
      message: 'Test tracking completed',
      originalLog: deliveryLog,
      trackResult: trackResult,
      updatedLog: updatedLog,
      trackingWorked: updatedLog && updatedLog.some((log: any) => log.status === 'opened')
    });

  } catch (error: any) {
    console.error('Test tracking error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}