import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { requireAuthApi } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // 🔒 Authentication check - Admin only
  const authResult = await requireAuthApi(req, res);
  if (!authResult) {
    return; // requireAuthApi already sent the error response
  }

  try {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid notification IDs provided' 
      });
    }

    // Delete notifications from database
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting notifications:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete notifications',
        details: error.message
      });
    }

    // Also delete related delivery logs (optional - depends on your data retention policy)
    const { error: logError } = await supabase
      .from('notification_delivery_log')
      .delete()
      .in('notification_id', ids);

    if (logError) {
      console.warn('Warning: Failed to delete delivery logs:', logError);
      // Don't fail the operation if log deletion fails
    }

    return res.status(200).json({ 
      success: true, 
      deletedCount: ids.length,
      message: `Successfully deleted ${ids.length} notification(s)`
    });

  } catch (error: any) {
    console.error('Delete notifications error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
}