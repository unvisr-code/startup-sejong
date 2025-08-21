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
    console.log('🔧 Updating database schema for push notification tracking...');

    const updates = [];
    const errors = [];

    // Step 1: Update status constraint to allow 'opened'
    try {
      // First try to drop existing constraint
      const { error: dropError } = await supabaseAdmin.rpc('sql', {
        query: `
          DO $$ 
          BEGIN
              IF EXISTS (
                  SELECT 1 FROM information_schema.check_constraints 
                  WHERE constraint_name = 'notification_delivery_log_status_check'
              ) THEN
                  ALTER TABLE notification_delivery_log DROP CONSTRAINT notification_delivery_log_status_check;
              END IF;
          END $$;
        `
      });

      if (dropError) {
        console.log('Could not drop existing constraint (may not exist):', dropError.message);
      }

      // Add new constraint
      const { error: addConstraintError } = await supabaseAdmin.rpc('sql', {
        query: `
          ALTER TABLE notification_delivery_log 
          ADD CONSTRAINT notification_delivery_log_status_check 
          CHECK (status IN ('sent', 'failed', 'opened'));
        `
      });

      if (addConstraintError) {
        throw new Error(`Failed to add status constraint: ${addConstraintError.message}`);
      }

      updates.push('✅ Updated status constraint to allow opened status');
    } catch (error: any) {
      errors.push(`❌ Status constraint update failed: ${error.message}`);
    }

    // Step 2: Add opened_at column
    try {
      const { error: addColumnError } = await supabaseAdmin.rpc('sql', {
        query: `
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notification_delivery_log' 
                  AND column_name = 'opened_at'
              ) THEN
                  ALTER TABLE notification_delivery_log ADD COLUMN opened_at TIMESTAMP WITH TIME ZONE;
              END IF;
          END $$;
        `
      });

      if (addColumnError) {
        throw new Error(`Failed to add opened_at column: ${addColumnError.message}`);
      }

      updates.push('✅ Added opened_at column to notification_delivery_log');
    } catch (error: any) {
      errors.push(`❌ opened_at column addition failed: ${error.message}`);
    }

    // Step 3: Add open_count column to notifications
    try {
      const { error: addOpenCountError } = await supabaseAdmin.rpc('sql', {
        query: `
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notifications' 
                  AND column_name = 'open_count'
              ) THEN
                  ALTER TABLE notifications ADD COLUMN open_count INTEGER DEFAULT 0;
              END IF;
          END $$;
        `
      });

      if (addOpenCountError) {
        throw new Error(`Failed to add open_count column: ${addOpenCountError.message}`);
      }

      updates.push('✅ Added open_count column to notifications');
    } catch (error: any) {
      errors.push(`❌ open_count column addition failed: ${error.message}`);
    }

    // Step 4: Test the new constraint
    try {
      // Try to insert a test record with 'opened' status
      const testNotificationId = 'test-notification-id';
      const testSubscriptionId = 'test-subscription-id';

      const { error: testError } = await supabaseAdmin
        .from('notification_delivery_log')
        .insert({
          notification_id: testNotificationId,
          subscription_id: testSubscriptionId,
          status: 'opened',
          opened_at: new Date().toISOString()
        });

      if (testError) {
        throw new Error(`Status constraint test failed: ${testError.message}`);
      }

      // Clean up test record
      await supabaseAdmin
        .from('notification_delivery_log')
        .delete()
        .eq('notification_id', testNotificationId)
        .eq('subscription_id', testSubscriptionId);

      updates.push('✅ Status constraint test passed - opened status works');
    } catch (error: any) {
      errors.push(`❌ Status constraint test failed: ${error.message}`);
    }

    // Verify schema
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc('sql', {
      query: `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns 
        WHERE (table_name = 'notifications' AND column_name = 'open_count')
           OR (table_name = 'notification_delivery_log' AND column_name = 'opened_at')
        ORDER BY table_name, column_name;
      `
    });

    res.status(200).json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Schema update completed successfully' : 'Schema update completed with some errors',
      updates: updates,
      errors: errors,
      errorCount: errors.length,
      updateCount: updates.length,
      verificationData: columns || null,
      timestamp: new Date().toISOString()
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