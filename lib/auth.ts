import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';
import { NextRouter } from 'next/router';
import { NextApiRequest, NextApiResponse } from 'next';

// Client-side authentication check
export const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async (router: NextRouter) => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  router.push('/');
};

// Client-side route protection
export const requireAuth = async (router: NextRouter) => {
  const session = await checkAuth();
  if (!session) {
    router.push('/admin/login');
    return null;
  }
  return session;
};

// Server-side API authentication middleware
export const requireAuthApi = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: any } | null> => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return null;
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    // Verify token using admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return null;
    }

    // Optionally check if user has admin role
    // You can add custom claims or check user metadata here
    // Example: if (user.user_metadata?.role !== 'admin') { ... }

    return { user };
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    return null;
  }
};

// Simpler version for internal API routes (checks session cookie)
export const requireAuthApiSimple = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: any } | null> => {
  try {
    // Get session from cookie (Next.js automatically handles cookies)
    const authCookie = req.cookies['sb-access-token'] || req.cookies['sb-refresh-token'];

    if (!authCookie) {
      res.status(401).json({ error: 'Not authenticated' });
      return null;
    }

    // For simplicity, you can also check the session directly if using cookie-based auth
    // This approach works when the client sends cookies with the request

    res.status(401).json({ error: 'Authentication required. Please use Bearer token.' });
    return null;
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    return null;
  }
};