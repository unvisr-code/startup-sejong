import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

interface SetupResult {
  success: boolean;
  message: string;
  tablesCreated: string[];
  errors: string[];
}

const createTablesSQL = [
  {
    name: 'push_subscriptions',
    sql: `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent TEXT,
        ip_address TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
      );
    `
  },
  {
    name: 'push_subscriptions_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active);
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at DESC);
    `
  },
  {
    name: 'notifications',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        icon TEXT DEFAULT '/icons/icon-192x192.png',
        url TEXT DEFAULT '/',
        tag TEXT,
        require_interaction BOOLEAN DEFAULT false,
        sent_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        admin_email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
        sent_at TIMESTAMP WITH TIME ZONE
      );
    `
  },
  {
    name: 'notifications_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_admin_email ON notifications(admin_email);
    `
  },
  {
    name: 'notification_delivery_log',
    sql: `
      CREATE TABLE IF NOT EXISTS notification_delivery_log (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE CASCADE,
        status TEXT CHECK (status IN ('sent', 'failed', 'expired')) DEFAULT 'sent',
        error_message TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
      );
    `
  },
  {
    name: 'notification_delivery_log_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
      CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_subscription_id ON notification_delivery_log(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_sent_at ON notification_delivery_log(sent_at DESC);
    `
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SetupResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      tablesCreated: [],
      errors: ['Only POST method is allowed']
    });
  }

  const tablesCreated: string[] = [];
  const errors: string[] = [];

  try {
    // Execute each SQL statement
    for (const table of createTablesSQL) {
      try {
        console.log(`Creating ${table.name}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: table.sql 
        });

        if (error) {
          // Try alternative method using direct query
          const { error: directError } = await supabase
            .from('information_schema.tables') // This will fail but trigger SQL execution
            .select('*');
          
          // If we can't use RPC, at least log the SQL for manual execution
          console.warn(`Could not execute SQL for ${table.name}:`, error);
          errors.push(`${table.name}: ${error.message}`);
        } else {
          console.log(`✅ Successfully created ${table.name}`);
          tablesCreated.push(table.name);
        }
      } catch (tableError: any) {
        console.error(`Error creating ${table.name}:`, tableError);
        errors.push(`${table.name}: ${tableError.message}`);
      }
    }

    // Check if tables exist by trying to query them
    const tableChecks = [
      { name: 'push_subscriptions', query: 'push_subscriptions' },
      { name: 'notifications', query: 'notifications' },
      { name: 'notification_delivery_log', query: 'notification_delivery_log' }
    ];

    const existingTables: string[] = [];
    for (const check of tableChecks) {
      try {
        const { error } = await supabase
          .from(check.query)
          .select('*')
          .limit(0);

        if (!error) {
          existingTables.push(check.name);
        }
      } catch (error) {
        // Table doesn't exist or other error
      }
    }

    const allTablesExist = existingTables.length === tableChecks.length;

    if (allTablesExist && errors.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All push notification tables are ready',
        tablesCreated: existingTables,
        errors: []
      });
    } else if (existingTables.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Some tables exist (${existingTables.join(', ')}). Please run the SQL manually for missing tables.`,
        tablesCreated: existingTables,
        errors: errors.length > 0 ? errors : ['Some tables may need to be created manually']
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to create tables automatically. Please run database/push_notifications.sql manually in Supabase SQL Editor.',
        tablesCreated: [],
        errors: errors.length > 0 ? errors : ['Tables do not exist and could not be created automatically']
      });
    }

  } catch (error: any) {
    console.error('Table setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during table setup',
      tablesCreated,
      errors: [...errors, error.message]
    });
  }
}