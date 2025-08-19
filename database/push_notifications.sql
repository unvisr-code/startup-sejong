-- Push Notifications Tables for PWA
-- Add this to your Supabase SQL Editor

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- =====================================================
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

-- Create indexes for faster queries
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_is_active ON push_subscriptions(is_active);
CREATE INDEX idx_push_subscriptions_created_at ON push_subscriptions(created_at DESC);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
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

-- Create indexes for faster queries
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX idx_notifications_admin_email ON notifications(admin_email);

-- =====================================================
-- NOTIFICATION DELIVERY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('sent', 'failed', 'expired')) DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- Create indexes for faster queries
CREATE INDEX idx_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_subscription_id ON notification_delivery_log(subscription_id);
CREATE INDEX idx_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX idx_delivery_log_sent_at ON notification_delivery_log(sent_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for push_subscriptions updated_at
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE
    ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Push subscriptions policies (anyone can subscribe, only authenticated can manage)
CREATE POLICY "Anyone can create push subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own subscription" ON push_subscriptions
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can view subscriptions" ON push_subscriptions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete subscriptions" ON push_subscriptions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Notifications policies (only authenticated users can manage)
CREATE POLICY "Authenticated users can create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view notifications" ON notifications
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update notifications" ON notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Delivery log policies (only authenticated users can view)
CREATE POLICY "Authenticated users can view delivery log" ON notification_delivery_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert delivery log" ON notification_delivery_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE QUERIES (for testing)
-- =====================================================

-- Get active subscription count
-- SELECT COUNT(*) FROM push_subscriptions WHERE is_active = true;

-- Get notification delivery stats
-- SELECT 
--   n.title,
--   n.sent_count,
--   n.success_count,
--   n.error_count,
--   ROUND((n.success_count::float / NULLIF(n.sent_count, 0)) * 100, 2) as success_rate
-- FROM notifications n
-- ORDER BY n.created_at DESC
-- LIMIT 10;

-- Clean up old inactive subscriptions (run periodically)
-- DELETE FROM push_subscriptions 
-- WHERE is_active = false 
-- AND updated_at < NOW() - INTERVAL '30 days';