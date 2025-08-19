import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ error: 'Missing subscription keys' });
    }

    // Save subscription to database
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint,
        p256dh_key: p256dh,
        auth_key: auth,
        user_agent: req.headers['user-agent'] || '',
        ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || '',
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    res.status(200).json({ 
      message: 'Subscription saved successfully',
      subscriptionId: data.id
    });

  } catch (error) {
    console.error('Subscribe API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}