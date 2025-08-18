import { supabase } from './supabase';
import { NextRouter } from 'next/router';

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

export const requireAuth = async (router: NextRouter) => {
  const session = await checkAuth();
  if (!session) {
    router.push('/admin/login');
    return null;
  }
  return session;
};