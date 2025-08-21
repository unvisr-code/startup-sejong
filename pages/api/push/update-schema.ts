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
    console.log('🔧 Updating database schema...');

    // Add open_count column to notifications table
    const { error: addColumnError } = await supabaseAdmin.rpc('add_column_if_not_exists', {
      table_name: 'notifications',
      column_name: 'open_count',
      column_type: 'integer DEFAULT 0'
    });

    if (addColumnError) {
      console.log('RPC method not available, trying direct SQL...');
      
      // Alternative: Use direct SQL
      const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        query: 'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0;'
      });

      if (sqlError) {
        console.log('Direct SQL also failed, trying manual approach...');
        
        // Try to add the column manually
        try {
          await supabaseAdmin.from('notifications').select('open_count').limit(1);
          console.log('✅ open_count column already exists');
        } catch (err) {
          console.log('Column does not exist, manual creation needed');
          return res.status(500).json({
            error: 'Cannot add open_count column automatically',
            instruction: 'Please add this column manually in Supabase SQL Editor: ALTER TABLE notifications ADD COLUMN open_count INTEGER DEFAULT 0;',
            details: sqlError.message
          });
        }
      }
    }

    // Check delivery log table for opened_at column
    const { data: sampleDeliveryLog } = await supabaseAdmin
      .from('notification_delivery_log')
      .select('*')
      .limit(1);

    const deliveryColumns = sampleDeliveryLog && sampleDeliveryLog.length > 0 
      ? Object.keys(sampleDeliveryLog[0]) 
      : [];

    if (!deliveryColumns.includes('opened_at')) {
      console.log('Adding opened_at column to notification_delivery_log...');
      
      const { error: deliveryError } = await supabaseAdmin.rpc('exec_sql', {
        query: 'ALTER TABLE notification_delivery_log ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;'
      });

      if (deliveryError) {
        return res.status(500).json({
          error: 'Cannot add opened_at column to delivery log',
          instruction: 'Please add this column manually in Supabase SQL Editor: ALTER TABLE notification_delivery_log ADD COLUMN opened_at TIMESTAMP WITH TIME ZONE;',
          details: deliveryError.message
        });
      }
    }

    // Verify the schema updates
    const { data: updatedNotifications, error: verifyError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .limit(1);

    const updatedColumns = updatedNotifications && updatedNotifications.length > 0 
      ? Object.keys(updatedNotifications[0]) 
      : [];

    console.log('📋 Updated notifications columns:', updatedColumns);

    res.status(200).json({
      success: true,
      message: 'Schema updated successfully',
      notifications_columns: updatedColumns,
      has_open_count: updatedColumns.includes('open_count'),
      delivery_log_columns: deliveryColumns,
      has_opened_at: deliveryColumns.includes('opened_at')
    });

  } catch (error: any) {
    console.error('Schema update error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}