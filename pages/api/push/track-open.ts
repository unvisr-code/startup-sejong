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

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    console.log('📊 Tracking notification open:', { notificationId, subscriptionId });

    // Update to opened status with proper opened_at timestamp
    const { data, error } = await supabaseAdmin
      .from('notification_delivery_log')
      .update({ 
        status: 'opened',
        opened_at: new Date().toISOString()
      })
      .eq('notification_id', notificationId)
      .eq('subscription_id', subscriptionId || '')
      .eq('status', 'sent')
      .select();

    if (error) {
      console.error('Error updating delivery log:', error);
      // Still return success to avoid blocking the user experience
      return res.status(200).json({ 
        success: true, 
        message: 'Tracked (with database warning)',
        warning: error.message 
      });
    }

    console.log('✅ Successfully tracked notification open:', data);

    // Update open_count in notifications table
    if (data && data.length > 0) {
      console.log('📈 Successfully updated delivery log for notification:', notificationId);
      
      // Increment open_count in notifications table
      try {
        // Get current open_count and increment it
        const { data: currentNotification } = await supabaseAdmin
          .from('notifications')
          .select('open_count')
          .eq('id', notificationId)
          .single();
        
        const currentCount = currentNotification?.open_count || 0;
        
        await supabaseAdmin
          .from('notifications')
          .update({ open_count: currentCount + 1 })
          .eq('id', notificationId);
          
        console.log(`📊 Updated open_count from ${currentCount} to ${currentCount + 1}`);
      } catch (countError) {
        console.warn('Failed to update open_count:', countError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Notification open tracked successfully',
      openCount: data?.length || 0
    });

  } catch (error: any) {
    console.error('Track open API error:', error);
    
    // Don't block user experience with tracking errors
    res.status(200).json({
      success: true,
      message: 'Tracked (with error)',
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}