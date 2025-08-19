import { NextApiRequest, NextApiResponse } from 'next';

interface ConfigStatus {
  isConfigured: boolean;
  vapidPublicKey: boolean;
  vapidPrivateKey: boolean;
  vapidEmail: boolean;
  supabaseUrl: boolean;
  supabaseKey: boolean;
  errors: string[];
  environment: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ConfigStatus>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      isConfigured: false,
      vapidPublicKey: false,
      vapidPrivateKey: false,
      vapidEmail: false,
      supabaseUrl: false,
      supabaseKey: false,
      errors: ['Method not allowed'],
      environment: 'unknown'
    });
  }

  const errors: string[] = [];
  const environment = process.env.NODE_ENV || 'development';
  
  // Check VAPID configuration
  const vapidPublicKey = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.length > 20);
  const vapidPrivateKey = !!(process.env.VAPID_PRIVATE_KEY && process.env.VAPID_PRIVATE_KEY.length > 20);
  const vapidEmail = !!(process.env.VAPID_EMAIL && process.env.VAPID_EMAIL.includes('@'));
  
  // Check Supabase configuration
  const supabaseUrl = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://'));
  const supabaseKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 50);

  // Collect errors
  if (!vapidPublicKey) {
    errors.push('NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing or invalid');
  }
  if (!vapidPrivateKey) {
    errors.push('VAPID_PRIVATE_KEY is missing or invalid');
  }
  if (!vapidEmail) {
    errors.push('VAPID_EMAIL is missing or invalid');
  }
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is missing or invalid');
  }
  if (!supabaseKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid');
  }

  const isConfigured = vapidPublicKey && vapidPrivateKey && vapidEmail && supabaseUrl && supabaseKey;

  return res.status(200).json({
    isConfigured,
    vapidPublicKey,
    vapidPrivateKey,
    vapidEmail,
    supabaseUrl,
    supabaseKey,
    errors,
    environment
  });
}