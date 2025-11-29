-- Create access_requests table for user registration requests
-- Run this SQL in Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT
);

-- 2. Add comments
COMMENT ON TABLE access_requests IS 'User access requests pending admin approval';
COMMENT ON COLUMN access_requests.email IS 'Requestor email address';
COMMENT ON COLUMN access_requests.full_name IS 'Requestor full name';
COMMENT ON COLUMN access_requests.status IS 'Request status: pending, approved, or rejected';
COMMENT ON COLUMN access_requests.approved_by IS 'Admin user who approved/rejected the request';
COMMENT ON COLUMN access_requests.user_id IS 'Created user ID after approval';

-- 3. Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
-- Allow anyone to insert (submit request)
CREATE POLICY "Anyone can submit access requests"
ON access_requests FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins to view all requests
CREATE POLICY "Admins can view all access requests"
ON access_requests FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_info
        WHERE profile_info.user_id = auth.uid()
        AND profile_info.role = 'admin'
    )
);

-- Allow admins to update requests
CREATE POLICY "Admins can update access requests"
ON access_requests FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_info
        WHERE profile_info.user_id = auth.uid()
        AND profile_info.role = 'admin'
    )
);

-- Allow admins to delete requests
CREATE POLICY "Admins can delete access requests"
ON access_requests FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profile_info
        WHERE profile_info.user_id = auth.uid()
        AND profile_info.role = 'admin'
    )
);

-- 5. Create indexes
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_email ON access_requests(email);
CREATE INDEX idx_access_requests_created_at ON access_requests(created_at DESC);

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON access_requests
FOR EACH ROW
EXECUTE FUNCTION update_access_requests_updated_at();

-- 7. Verify table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'access_requests'
ORDER BY ordinal_position;
