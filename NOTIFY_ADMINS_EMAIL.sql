-- SIMPLE EMAIL NOTIFICATION FOR ACCESS REQUESTS
-- Uses Supabase's built-in email system (no API keys needed!)

-- Step 1: Create email notification function
CREATE OR REPLACE FUNCTION send_access_request_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_email TEXT;
BEGIN
    -- Get admin email(s)
    FOR admin_email IN 
        SELECT p.email 
        FROM profile_info p
        WHERE p.role = 'admin'
    LOOP
        -- Insert into a notifications table that your app can poll
        -- OR use Supabase's built-in email via pg_net extension
        
        -- Using pg_net to send email (if enabled)
        PERFORM net.http_post(
            url := 'https://api.supabase.co/auth/v1/admin/users/' || 
                   (SELECT user_id FROM profile_info WHERE email = admin_email LIMIT 1) || 
                   '/email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
            ),
            body := jsonb_build_object(
                'email', admin_email,
                'subject', '🔔 New Access Request',
                'html', '<h2>New Access Request Received</h2>' ||
                       '<p><strong>Name:</strong> ' || NEW.full_name || '</p>' ||
                       '<p><strong>Email:</strong> ' || NEW.email || '</p>' ||
                       '<p><a href="' || current_setting('app.settings.url', true) || 
                       '/admin/dashboard?tab=access-requests">Review Request</a></p>'
            )
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger
DROP TRIGGER IF EXISTS notify_admin_on_new_request ON access_requests;
CREATE TRIGGER notify_admin_on_new_request
    AFTER INSERT ON access_requests
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION send_access_request_notification();

-- Note: This requires pg_net extension to be enabled
-- Enable it in Supabase Dashboard: Database → Extensions → pg_net
