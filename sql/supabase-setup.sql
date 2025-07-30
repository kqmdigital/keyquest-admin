-- Keyquest Mortgage Admin - Complete Supabase Setup
-- Run these commands in Supabase SQL Editor

-- 1. CREATE TABLES
-- =================

-- Banks Table
CREATE TABLE IF NOT EXISTS banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bankers Table
CREATE TABLE IF NOT EXISTS bankers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  bank_access TEXT[], -- Array of bank names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate Types Table
CREATE TABLE IF NOT EXISTS rate_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_type VARCHAR(255) NOT NULL,
  rate_value DECIMAL(6,3) NOT NULL, -- e.g., 2.150 for 2.15%
  bank_names TEXT[], -- Array of associated bank names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rate_type, rate_value)
);

-- Rate Packages Table
CREATE TABLE IF NOT EXISTS rate_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES banks(id),
  bank_name VARCHAR(255),
  loan_type VARCHAR(255) CHECK (loan_type IN ('New Home Loan', 'Refinancing Home Loan')),
  property_type VARCHAR(255), -- 'Private Property', 'HDB', 'EC', 'Private Property, EC'
  property_status VARCHAR(255) CHECK (property_status IN ('Completed', 'Under Construction')),
  rate_type_category VARCHAR(50) CHECK (rate_type_category IN ('Fixed', 'Floating')),
  reference_rate VARCHAR(255),
  loan_amount BIGINT,
  lock_period VARCHAR(50),
  
  -- Interest Rate Information (Year by Year)
  year1_rate_type VARCHAR(255),
  year1_operator VARCHAR(5) CHECK (year1_operator IN ('+', '-')),
  year1_value DECIMAL(6,3),
  year2_rate_type VARCHAR(255),
  year2_operator VARCHAR(5) CHECK (year2_operator IN ('+', '-')),
  year2_value DECIMAL(6,3),
  year3_rate_type VARCHAR(255),
  year3_operator VARCHAR(5) CHECK (year3_operator IN ('+', '-')),
  year3_value DECIMAL(6,3),
  year4_rate_type VARCHAR(255),
  year4_operator VARCHAR(5) CHECK (year4_operator IN ('+', '-')),
  year4_value DECIMAL(6,3),
  year5_rate_type VARCHAR(255),
  year5_operator VARCHAR(5) CHECK (year5_operator IN ('+', '-')),
  year5_value DECIMAL(6,3),
  thereafter_rate_type VARCHAR(255),
  thereafter_operator VARCHAR(5) CHECK (thereafter_operator IN ('+', '-')),
  thereafter_value DECIMAL(6,3),
  
  -- Other Information
  minimum_loan_size BIGINT,
  lock_in_period VARCHAR(50),
  partial_pay_penalty DECIMAL(5,2),
  full_redeem_penalty DECIMAL(5,2),
  cancellation_penalty DECIMAL(5,2),
  legal_fee_subsidy BOOLEAN DEFAULT FALSE,
  valuation_subsidy BOOLEAN DEFAULT FALSE,
  partial_repayment BOOLEAN DEFAULT FALSE,
  waiver_due_to_sales BOOLEAN DEFAULT FALSE,
  free_conversion_12m BOOLEAN DEFAULT FALSE,
  free_conversion_24m BOOLEAN DEFAULT FALSE,
  free_conversion_36m BOOLEAN DEFAULT FALSE,
  
  -- Package Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'under_construction')),
  
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  property_type VARCHAR(255),
  loan_amount BIGINT,
  preferred_bank VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Completed', 'Closed')),
  assigned_agent_id UUID REFERENCES agents(id),
  assigned_agent_name VARCHAR(255), -- Denormalized for easier queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table (Optional - for additional admin management)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERT SAMPLE DATA
-- =====================

-- Insert Banks
INSERT INTO banks (name) VALUES 
('CIMB'),
('OCBC'),
('UOB'),
('DBS'),
('Maybank'),
('Standard Chartered'),
('HSBC'),
('SBI'),
('Bank Of China'),
('Hong Leong Finance'),
('Singapura Finance'),
('RHB Bank'),
('Sing Investments & Finance'),
('Citibank')
ON CONFLICT (name) DO NOTHING;

-- Insert Agents
INSERT INTO agents (name, email, status) VALUES 
('Keyquest Morgage', 'account@keyquestmortgage.com.sg', 'Active'),
('Joreen Ng', 'Joreen@keyquestmortgage.com.sg', 'Active'),
('PA sales', 'kenneth.pa@keyquestmortgage.com.sg', 'Active'),
('Contact Us', 'contactus@keyquestmortgage.com.sg', 'Active'),
('Kenneth Toh', 'kenneth@keyquestmortgage.com.sg', 'Active'),
('Hui En', 'huien@keyquestmortgage.com.sg', 'Active'),
('Maegan Chia', 'Maegan@keyquestmortgage.com.sg', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Insert Bankers
INSERT INTO bankers (name, email, bank_access) VALUES 
('admin', 'admin@local.com', '{}'),
('Sub Admin', 'contactus@keyquestmortgage.com.sg', '{"CIMB","OCBC","UOB","DBS","Maybank","Standard Chartered","HSBC","SBI","Bank Of China","Hong Leong Finance","Singapura Finance","RHB Bank","Sing Investments & Finance","Citibank"}'),
('Ds', 'dev@harnods.com', '{}'),
('ahmad', 'ahmad@harnods.com', '{"CIMB","OCBC","UOB","DBS","Maybank","Standard Chartered","HSBC","SBI","Bank Of China","Hong Leong Finance","Singapura Finance","RHB Bank","Sing Investments & Finance","Citibank"}'),
('Timo Lim', 'dibuat12@gmail.com', '{"CIMB"}'),
('Ata', 'fata@harnods.com', '{"OCBC"}'),
('Ben White', 'dibuat12+1@gmail.com', '{"OCBC"}'),
('Gema Harnods', 'gema@harnods.com', '{"CIMB"}'),
('Ryan', 'manz.near@gmail.com', '{"OCBC"}'),
('Ryan OCBC', 'ahmad+2@harnods.com', '{"CIMB"}')
ON CONFLICT (email) DO NOTHING;

-- Insert Rate Types
INSERT INTO rate_types (rate_type, rate_value, bank_names) VALUES 
('FIXED', 0.000, '{"CIMB","OCBC","UOB","DBS","Maybank","Standard Chartered","HSBC","SBI","Bank Of China","Hong Leong Finance","Singapura Finance","RHB Bank","Sing Investments & Finance"}'),
('3M SORA', 2.000, '{"CIMB","OCBC","UOB","DBS","Maybank","Standard Chartered","HSBC","SBI","Bank Of China","Hong Leong Finance","Singapura Finance","RHB Bank","Sing Investments & Finance"}'),
('1M SORA', 1.660, '{"CIMB","OCBC","UOB","DBS","Maybank","Standard Chartered","HSBC","SBI","Bank Of China","Hong Leong Finance","Singapura Finance","RHB Bank","Sing Investments & Finance"}'),
('FHR6', 2.150, '{"DBS"}'),
('PPR', 6.150, '{"Hong Leong Finance"}'),
('PLR', 5.350, '{"Singapura Finance"}'),
('HHR', 7.000, '{"Hong Leong Finance"}'),
('PBR', 4.050, '{"Hong Leong Finance"}'),
('NMBR', 7.850, '{"Maybank"}'),
('1M COF', 3.120, '{"RHB Bank"}')
ON CONFLICT (rate_type, rate_value) DO NOTHING;

-- Insert Sample Rate Packages
INSERT INTO rate_packages (
  bank_name, property_type, reference_rate, property_status, rate_type_category, 
  loan_amount, loan_type, lock_period, status, minimum_loan_size
) VALUES 
('Bank Of China', 'Private Property, EC', '2 Years Fixed Rate', 'Completed', 'Fixed', 1000000, 'Refinancing Home Loan', '2 Years', 'completed', 1000000),
('Bank Of China', 'Private Property, EC', '2 Years Fixed Rate', 'Completed', 'Fixed', 1000000, 'New Home Loan', '2 Years', 'completed', 1000000),
('Bank Of China', 'Private Property, EC', '3M SORA', 'Under Construction', 'Floating', 800000, 'New Home Loan', '0 Years', 'under_construction', 800000),
('CIMB', 'Private Property, EC', '3M SORA Rate', 'Under Construction', 'Floating', 800000, 'New Home Loan', '0 Years', 'under_construction', 800000);

-- Insert Sample Enquiries
INSERT INTO enquiries (
  customer_name, email, phone, property_type, loan_amount, 
  preferred_bank, message, status, assigned_agent_name
) VALUES 
('John Doe', 'john.doe@email.com', '+65 9123 4567', 'Private Property', 800000, 'DBS', 'Looking for the best mortgage rates for a private property purchase. Need assistance with loan application and comparison of different bank offerings.', 'New', 'Joreen Ng'),
('Jane Smith', 'jane.smith@email.com', '+65 8765 4321', 'HDB', 400000, 'OCBC', 'First time home buyer seeking guidance on HDB loan options and eligibility requirements.', 'Completed', 'Kenneth Toh'),
('Michael Chen', 'michael.chen@email.com', '+65 9876 5432', 'EC', 600000, 'UOB', 'Interested in refinancing current loan and exploring better rates for EC property.', 'In Progress', 'PA sales'),
('Sarah Lim', 'sarah.lim@email.com', '+65 8765 1234', 'Private Property', 1200000, 'CIMB', 'Investment property purchase, need competitive rates and flexible terms.', 'New', 'Hui En'),
('David Wong', 'david.wong@email.com', '+65 9234 5678', 'HDB', 350000, 'Maybank', 'Completed loan application, no longer require services.', 'Closed', 'Contact Us');

-- Insert Admin User
INSERT INTO admin_users (email, name, role) VALUES 
('admin@keyquestmortgage.com.sg', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- ======================

-- Banks policies
DROP POLICY IF EXISTS "Allow authenticated users full access to banks" ON banks;
CREATE POLICY "Allow authenticated users full access to banks" 
ON banks FOR ALL 
USING (auth.role() = 'authenticated');

-- Agents policies
DROP POLICY IF EXISTS "Allow authenticated users full access to agents" ON agents;
CREATE POLICY "Allow authenticated users full access to agents" 
ON agents FOR ALL 
USING (auth.role() = 'authenticated');

-- Bankers policies
DROP POLICY IF EXISTS "Allow authenticated users full access to bankers" ON bankers;
CREATE POLICY "Allow authenticated users full access to bankers" 
ON bankers FOR ALL 
USING (auth.role() = 'authenticated');

-- Rate Types policies
DROP POLICY IF EXISTS "Allow authenticated users full access to rate_types" ON rate_types;
CREATE POLICY "Allow authenticated users full access to rate_types" 
ON rate_types FOR ALL 
USING (auth.role() = 'authenticated');

-- Rate Packages policies
DROP POLICY IF EXISTS "Allow authenticated users full access to rate_packages" ON rate_packages;
CREATE POLICY "Allow authenticated users full access to rate_packages" 
ON rate_packages FOR ALL 
USING (auth.role() = 'authenticated');

-- Enquiries policies
DROP POLICY IF EXISTS "Allow authenticated users full access to enquiries" ON enquiries;
CREATE POLICY "Allow authenticated users full access to enquiries" 
ON enquiries FOR ALL 
USING (auth.role() = 'authenticated');

-- Admin Users policies
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON admin_users;
CREATE POLICY "Allow authenticated users to read admin_users" 
ON admin_users FOR SELECT 
USING (auth.role() = 'authenticated');

-- 5. CREATE INDEXES FOR PERFORMANCE
-- =================================

-- Banks indexes
CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(name);
CREATE INDEX IF NOT EXISTS idx_banks_created_at ON banks(created_at);

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

-- Bankers indexes
CREATE INDEX IF NOT EXISTS idx_bankers_email ON bankers(email);
CREATE INDEX IF NOT EXISTS idx_bankers_created_at ON bankers(created_at);

-- Rate Types indexes
CREATE INDEX IF NOT EXISTS idx_rate_types_rate_type ON rate_types(rate_type);
CREATE INDEX IF NOT EXISTS idx_rate_types_created_at ON rate_types(created_at);

-- Rate Packages indexes
CREATE INDEX IF NOT EXISTS idx_rate_packages_bank_name ON rate_packages(bank_name);
CREATE INDEX IF NOT EXISTS idx_rate_packages_status ON rate_packages(status);
CREATE INDEX IF NOT EXISTS idx_rate_packages_property_type ON rate_packages(property_type);
CREATE INDEX IF NOT EXISTS idx_rate_packages_created_at ON rate_packages(created_at);

-- Enquiries indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);

-- Admin Users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- 6. CREATE FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_banks_updated_at ON banks;
CREATE TRIGGER update_banks_updated_at 
    BEFORE UPDATE ON banks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bankers_updated_at ON bankers;
CREATE TRIGGER update_bankers_updated_at 
    BEFORE UPDATE ON bankers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rate_types_updated_at ON rate_types;
CREATE TRIGGER update_rate_types_updated_at 
    BEFORE UPDATE ON rate_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rate_packages_updated_at ON rate_packages;
CREATE TRIGGER update_rate_packages_updated_at 
    BEFORE UPDATE ON rate_packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at 
    BEFORE UPDATE ON enquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. VERIFICATION QUERIES
-- =======================

-- Check if all tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('banks', 'agents', 'bankers', 'rate_types', 'rate_packages', 'enquiries', 'admin_users')
ORDER BY tablename;

-- Check sample data counts
SELECT 'banks' as table_name, COUNT(*) as record_count FROM banks
UNION ALL
SELECT 'agents' as table_name, COUNT(*) as record_count FROM agents
UNION ALL
SELECT 'bankers' as table_name, COUNT(*) as record_count FROM bankers
UNION ALL
SELECT 'rate_types' as table_name, COUNT(*) as record_count FROM rate_types
UNION ALL
SELECT 'rate_packages' as table_name, COUNT(*) as record_count FROM rate_packages
UNION ALL
SELECT 'enquiries' as table_name, COUNT(*) as record_count FROM enquiries
UNION ALL
SELECT 'admin_users' as table_name, COUNT(*) as record_count FROM admin_users
ORDER BY table_name;

-- SUCCESS! Database setup complete.
-- Next steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create a new user with email: admin@keyquestmortgage.com.sg
-- 3. Set password: admin123 (change this in production!)
-- 4. Your admin panel is now ready to use!
