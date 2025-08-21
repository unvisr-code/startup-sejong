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
    console.log('🔍 Checking database schema...');

    // Check notifications table structure
    const { data: notificationsSchema, error: notificationsError } = await supabaseAdmin.rpc('get_table_columns', {
      table_name: 'notifications'
    });

    if (notificationsError) {
      console.log('Using alternative method to check schema...');
      
      // Alternative: Try to select from notifications table to see structure
      const { data: sampleNotifications, error: sampleError } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('Cannot access notifications table:', sampleError);
        return res.status(500).json({
          error: 'Cannot access notifications table',
          details: sampleError.message
        });
      }

      const columns = sampleNotifications && sampleNotifications.length > 0 
        ? Object.keys(sampleNotifications[0]) 
        : [];

      console.log('📋 Notifications table columns:', columns);

      return res.status(200).json({
        success: true,
        notifications_columns: columns,
        has_open_count: columns.includes('open_count'),
        sample_data: sampleNotifications?.[0] || null
      });
    }

    // Check delivery log table
    const { data: sampleDeliveryLog, error: deliveryLogError } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*')
      .limit(1);

    const deliveryColumns = sampleDeliveryLog && sampleDeliveryLog.length > 0 
      ? Object.keys(sampleDeliveryLog[0]) 
      : [];

    console.log('📋 Delivery log columns:', deliveryColumns);

    res.status(200).json({
      success: true,
      notifications_schema: notificationsSchema,
      notifications_columns: notificationsSchema ? notificationsSchema.map((col: any) => col.column_name) : [],
      has_open_count: notificationsSchema ? notificationsSchema.some((col: any) => col.column_name === 'open_count') : false,
      delivery_log_columns: deliveryColumns,
      has_opened_at: deliveryColumns.includes('opened_at')
    });

  } catch (error: any) {
    console.error('Schema debug error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}