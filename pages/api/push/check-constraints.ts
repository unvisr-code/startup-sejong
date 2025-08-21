import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔍 Checking table constraints...');

    // Try to get constraint information using direct query
    const { data: constraints, error: constraintError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          SELECT 
            constraint_name,
            constraint_type,
            check_clause
          FROM information_schema.check_constraints 
          WHERE constraint_schema = 'public' 
          AND constraint_name LIKE '%notification_delivery_log%status%';
        `
      });

    // Alternative: Check what status values are actually allowed by trying different ones
    const testValues = ['sent', 'failed', 'opened', 'delivered', 'clicked'];
    const statusTests: any = {};

    for (const status of testValues) {
      try {
        // Try to insert a test record with this status
        const { error } = await supabaseAdmin
          .from('notification_delivery_log')
          .insert({
            notification_id: 'b6cafb4d-2e91-49d9-b7c3-99709455a05e',
            subscription_id: 'd8d3f781-93de-4e34-a434-7933fde9722b',
            status: status
          })
          .select();
        
        if (error) {
          statusTests[status] = { allowed: false, error: error.message };
        } else {
          statusTests[status] = { allowed: true };
          
          // Clean up test record
          await supabaseAdmin
            .from('notification_delivery_log')
            .delete()
            .eq('notification_id', 'b6cafb4d-2e91-49d9-b7c3-99709455a05e')
            .eq('subscription_id', 'd8d3f781-93de-4e34-a434-7933fde9722b')
            .eq('status', status)
            .order('sent_at', { ascending: false })
            .limit(1);
        }
      } catch (err: any) {
        statusTests[status] = { allowed: false, error: err.message };
      }
    }

    res.status(200).json({
      success: true,
      constraints: constraints,
      constraintError: constraintError?.message,
      statusTests: statusTests,
      allowedStatuses: Object.keys(statusTests).filter(s => statusTests[s].allowed)
    });

  } catch (error: any) {
    console.error('Check constraints error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}