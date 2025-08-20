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
    const { action } = req.body;
    
    let result;
    
    switch (action) {
      case 'clear-inactive':
        // Clear only inactive subscriptions
        result = await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .eq('is_active', false);
        break;
        
      case 'clear-old':
        // Clear subscriptions older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        result = await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .lt('created_at', thirtyDaysAgo.toISOString());
        break;
        
      case 'clear-all':
        // Clear all subscriptions (use with caution!)
        result = await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        break;
        
      case 'mark-inactive':
        // Mark all as inactive (safer than deleting)
        result = await supabaseAdmin
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('is_active', true);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    // Get updated subscription count
    const { count } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id', { count: 'exact' })
      .eq('is_active', true);
    
    res.status(200).json({
      success: true,
      message: `Action '${action}' completed successfully`,
      remainingActiveSubscriptions: count || 0
    });
    
  } catch (error: any) {
    console.error('Clear subscriptions error:', error);
    res.status(500).json({ 
      error: 'Failed to clear subscriptions',
      details: error.message 
    });
  }
}