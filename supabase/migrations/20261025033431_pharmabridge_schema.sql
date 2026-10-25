-- PharmaBridge Core Schema
--
-- Purpose: Migrate PharmaBridge JSON-file data store to Supabase so the browser
-- reads data directly via the anon-key client (no Express backend needed at
-- runtime). Fixes the "Database Connection Error" shown after login, which
-- occurred because the built static bundle has no Express API routes to call.
--
-- Tables:
--   1. agencies   - Wholesale stockist agencies and Medical Representatives (MRs).
--   2. products   - Medicine stock listings tied to an agency/MR.
--   3. promotions - MR/agency new-release tablet launch campaigns.
--   4. inquiries  - Purchase order inquiries from medical stores to agencies/MRs.
--
-- Security:
--   This app has no Supabase sign-in (the login screen is a client-only PIN gate
--   that does not create a Supabase session). The frontend therefore runs as the
--   anon role for its entire lifetime, so every policy lists TO anon, authenticated
--   and the data is intentionally shared/public across the single tenant. RLS is
--   enabled on all four tables; CRUD grants are given to anon, authenticated.
--   USING (true) is acceptable here because the data is intentionally public/shared
--   (single-tenant, no auth), per the bolt-database skill rules.
--
-- Notes:
--   All tables use text primary keys to preserve existing IDs (ag-1, prod-1, etc.)
--   referenced by the frontend and seed data.
--   Seed data mirrors the existing data/pharma_db.json defaults so the app renders
--   identical content after migration.
--   updated_at / created_at use timestamptz with now() defaults.

-- =========================================================
-- AGENCIES
-- =========================================================
CREATE TABLE IF NOT EXISTS agencies (
  id text PRIMARY KEY,
  name text NOT NULL,
  contact_person text NOT NULL,
  role text NOT NULL CHECK (role IN ('Agency Stockist', 'Medical Representative (MR)')),
  phone text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  drug_license_no text NOT NULL,
  gstin text NOT NULL,
  companies_represented text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) NOT NULL DEFAULT 0,
  delivery_eta text NOT NULL,
  minimum_order_value integer
);

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON agencies TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_agencies" ON agencies;
CREATE POLICY "anon_select_agencies" ON agencies FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_agencies" ON agencies;
CREATE POLICY "anon_insert_agencies" ON agencies FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_agencies" ON agencies;
CREATE POLICY "anon_update_agencies" ON agencies FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_agencies" ON agencies;
CREATE POLICY "anon_delete_agencies" ON agencies FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- PRODUCTS
-- =========================================================
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  generic_name text NOT NULL,
  category text NOT NULL,
  dosage_form text NOT NULL,
  pack_size text NOT NULL,
  batch_no text NOT NULL,
  mfg_date text,
  exp_date text NOT NULL,
  mrp numeric(10,2) NOT NULL DEFAULT 0,
  ptr numeric(10,2) NOT NULL DEFAULT 0,
  margin_percent numeric(5,1),
  stock_qty integer NOT NULL DEFAULT 0,
  min_order_qty integer NOT NULL DEFAULT 1,
  agency_id text NOT NULL,
  agency_name text NOT NULL,
  agency_city text NOT NULL,
  agency_address text,
  mr_name text NOT NULL,
  mr_phone text NOT NULL,
  mr_email text,
  company text NOT NULL,
  scheme text,
  is_new_release boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('bill_scan', 'manual', 'promotion')),
  bill_reference text
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- PROMOTIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS promotions (
  id text PRIMARY KEY,
  tablet_name text NOT NULL,
  generic_composition text NOT NULL,
  company text NOT NULL,
  launched_by text NOT NULL,
  role text NOT NULL CHECK (role IN ('MR', 'Agency')),
  contact_phone text NOT NULL,
  contact_whatsapp text NOT NULL,
  launch_headline text NOT NULL,
  key_indications text[] NOT NULL DEFAULT '{}',
  intro_offer text NOT NULL,
  ptr numeric(10,2) NOT NULL DEFAULT 0,
  mrp numeric(10,2) NOT NULL DEFAULT 0,
  sample_available boolean NOT NULL DEFAULT true,
  sample_stock integer,
  brochure_summary text NOT NULL,
  target_doctors text NOT NULL,
  territory text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON promotions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_promotions" ON promotions;
CREATE POLICY "anon_select_promotions" ON promotions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_promotions" ON promotions;
CREATE POLICY "anon_insert_promotions" ON promotions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_promotions" ON promotions;
CREATE POLICY "anon_update_promotions" ON promotions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_promotions" ON promotions;
CREATE POLICY "anon_delete_promotions" ON promotions FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- INQUIRIES
-- =========================================================
CREATE TABLE IF NOT EXISTS inquiries (
  id text PRIMARY KEY,
  medical_store_name text NOT NULL,
  pharmacist_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  requested_qty integer NOT NULL DEFAULT 1,
  agency_id text NOT NULL,
  agency_name text NOT NULL,
  mr_name text NOT NULL,
  mr_phone text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Dispatched')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON inquiries TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_inquiries" ON inquiries;
CREATE POLICY "anon_select_inquiries" ON inquiries FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_inquiries" ON inquiries;
CREATE POLICY "anon_insert_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_inquiries" ON inquiries;
CREATE POLICY "anon_update_inquiries" ON inquiries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_inquiries" ON inquiries;
CREATE POLICY "anon_delete_inquiries" ON inquiries FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- SEED DATA: AGENCIES
-- =========================================================
INSERT INTO agencies (id, name, contact_person, role, phone, whatsapp, email, city, state, drug_license_no, gstin, companies_represented, rating, delivery_eta, minimum_order_value) VALUES
('ag-1', 'Apex Pharma Distributors Pvt. Ltd.', 'Sunil Verma (Wholesale Head)', 'Agency Stockist', '+91 98230 44120', '919823044120', 'orders@apexpharmadist.com', 'Mumbai', 'Maharashtra', 'MH-MZ4-192841', '27AABCA1234F1Z8', ARRAY['GSK','Sun Pharma','Cipla','Abbott'], 4.9, 'Same Day (within 3 hrs)', 2000),
('ag-2', 'Rajesh Sharma', 'Rajesh Sharma', 'Medical Representative (MR)', '+91 98112 55901', '919811255901', 'r.sharma@microlabs.co.in', 'Mumbai & Thane', 'Maharashtra', 'MR-HQ-88219', '27AACPM9812A1ZX', ARRAY['Micro Labs Ltd.'], 4.8, 'Next Day Morning', 1500),
('ag-3', 'Metro Healthcare Agencies', 'Anand Kulkarni (Managing Partner)', 'Agency Stockist', '+91 98701 92840', '919870192840', 'dispatch@metrohealthagencies.com', 'Pune', 'Maharashtra', 'MH-PZ2-491028', '27AAECM5541L1Z0', ARRAY['Alkem Laboratories','Torrent Pharma','Lupin','Mankind'], 4.7, 'Within 4 Hours', 2500),
('ag-4', 'Pooja Deshmukh', 'Pooja Deshmukh', 'Medical Representative (MR)', '+91 98450 11982', '919845011982', 'pooja.d@sunpharma.com', 'Mumbai Central & South', 'Maharashtra', 'MR-SP-33910', '27AAMPS7711K1Z2', ARRAY['Sun Pharma Industries'], 4.9, 'Direct MR Booking (Same Day)', 1000),
('ag-5', 'Shree Balaji Medical Wholesale', 'Ramesh Patel', 'Agency Stockist', '+91 98205 33491', '919820533491', 'balajimedicalorders@gmail.com', 'Nagpur', 'Maharashtra', 'MH-NG1-772910', '27AASPM4421B1ZU', ARRAY['Glenmark','Zydus Cadila','Dr. Reddys','Intas'], 4.6, '24 Hours Express', 3000)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- SEED DATA: PRODUCTS
-- =========================================================
INSERT INTO products (id, name, generic_name, category, dosage_form, pack_size, batch_no, mfg_date, exp_date, mrp, ptr, margin_percent, stock_qty, min_order_qty, agency_id, agency_name, agency_city, agency_address, mr_name, mr_phone, company, scheme, is_new_release, verified, updated_at, source, bill_reference) VALUES
('prod-1', 'Augmentin 625 Duo', 'Amoxicillin (500mg) + Clavulanic Acid (125mg)', 'Antibiotic', 'Tablet', '1 x 10 Tablets (Strip)', 'AG8921', '2026-01-10', '2027-12-31', 223.50, 159.60, 28.6, 850, 10, 'ag-1', 'Apex Pharma Distributors Pvt. Ltd.', 'Mumbai', 'Shop 12-14, Medical Complex, Andheri East', 'Vikram Joshi (GSK Division)', '+91 98230 44120', 'GSK Pharmaceuticals Ltd.', '10 + 1 Free Scheme', false, true, now(), 'bill_scan', 'AP-INV-2026-881'),
('prod-2', 'Augmentin 625 Duo', 'Amoxicillin (500mg) + Clavulanic Acid (125mg)', 'Antibiotic', 'Tablet', '1 x 10 Tablets (Strip)', 'AG8914', '2025-12-05', '2027-11-30', 223.50, 158.00, 29.3, 420, 20, 'ag-3', 'Metro Healthcare Agencies', 'Pune', 'Gala 4, Wholesale Pharma Market, Swargate', 'Sanjay Shinde', '+91 98701 92840', 'GSK Pharmaceuticals Ltd.', 'Cash Discount 4% on 50+ strips', false, true, now(), 'manual', NULL),
('prod-3', 'Dolo 650', 'Paracetamol (650mg)', 'Analgesic & Antipyretic', 'Tablet', '1 x 15 Tablets (Strip)', 'DL2309', '2026-02-01', '2028-01-31', 34.50, 24.60, 28.7, 3200, 30, 'ag-2', 'Rajesh Sharma', 'Mumbai & Thane', 'Micro Labs Zonal Office, Mulund', 'Rajesh Sharma (Direct MR)', '+91 98112 55901', 'Micro Labs Ltd.', 'Special Box Rate on 100+ strips', false, true, now(), 'bill_scan', 'ML-BILL-4421'),
('prod-4', 'Pan 40', 'Pantoprazole Gastro-Resistant (40mg)', 'Antacid / PPI', 'Tablet', '1 x 15 Tablets (Strip)', 'PN7710', '2026-01-15', '2028-06-30', 178.00, 126.30, 29.0, 1100, 15, 'ag-3', 'Metro Healthcare Agencies', 'Pune', 'Gala 4, Wholesale Pharma Market, Swargate', 'Sameer Dighe (Alkem)', '+91 98701 92840', 'Alkem Laboratories', '15 + 1 Free Scheme', false, true, now(), 'bill_scan', 'ALK-INV-9902'),
('prod-5', 'Pantocid 40', 'Pantoprazole Gastro-Resistant (40mg)', 'Antacid / PPI', 'Tablet', '1 x 15 Tablets (Strip)', 'PT4412', '2026-01-20', '2027-12-31', 182.00, 128.50, 29.4, 680, 10, 'ag-4', 'Pooja Deshmukh', 'Mumbai Central & South', 'Sun Pharma Field HQ, Dadar', 'Pooja Deshmukh (Sun Gastro)', '+91 98450 11982', 'Sun Pharma Industries', '10 + 1 Scheme + Free Clinic Standee', false, true, now(), 'manual', NULL),
('prod-6', 'Telma 40', 'Telmisartan (40mg)', 'Cardiovascular / Antihypertensive', 'Tablet', '1 x 30 Tablets (Bottle)', 'TL9918', '2026-02-10', '2028-02-28', 248.00, 176.00, 29.0, 540, 10, 'ag-1', 'Apex Pharma Distributors Pvt. Ltd.', 'Mumbai', 'Shop 12-14, Medical Complex, Andheri East', 'Sunil Verma', '+91 98230 44120', 'Glenmark Pharmaceuticals', '5% extra on 25+ bottles', false, true, now(), 'bill_scan', 'GLN-7731'),
('prod-7', 'Montair-LC', 'Montelukast (10mg) + Levocetirizine (5mg)', 'Antiallergic & Respiratory', 'Tablet', '1 x 10 Tablets (Strip)', 'MLC502', '2026-01-18', '2028-04-30', 215.00, 152.00, 29.3, 950, 15, 'ag-1', 'Apex Pharma Distributors Pvt. Ltd.', 'Mumbai', 'Shop 12-14, Medical Complex, Andheri East', 'Deepak Rao (Cipla Breathe)', '+91 98230 44120', 'Cipla Ltd.', '10 + 1 Free Scheme', false, true, now(), 'bill_scan', NULL),
('prod-8', 'Azithral 500', 'Azithromycin (500mg)', 'Antibiotic', 'Tablet', '1 x 5 Tablets (Strip)', 'AZ6610', '2026-02-12', '2027-10-31', 132.00, 93.70, 29.0, 1400, 25, 'ag-3', 'Metro Healthcare Agencies', 'Pune', 'Gala 4, Wholesale Pharma Market, Swargate', 'Anand Kulkarni', '+91 98701 92840', 'Alembic Pharmaceuticals', '20 + 2 Free Scheme', false, true, now(), 'bill_scan', NULL),
('prod-9', 'Nexetra 10mg SR', 'Vonoprazan Fumarate Sustained Release (10mg)', 'Antacid / Potassium-Competitive Acid Blocker (P-CAB)', 'Tablet', '1 x 10 Tablets (Strip)', 'NX4012A', '2026-03-01', '2028-02-28', 195.00, 134.00, 31.2, 600, 10, 'ag-4', 'Pooja Deshmukh', 'Mumbai Central & South', 'Sun Pharma Field HQ, Dadar', 'Pooja Deshmukh (Direct MR)', '+91 98450 11982', 'Sun Pharma Industries', 'LAUNCH OFFER: 10 + 2 Free + 5 Free Doctor Trial Packs', true, true, now(), 'promotion', NULL),
('prod-10', 'Covifex 500mg', 'Faropenem Sodium Extended Release (500mg)', 'Advanced Antibiotic (Penem)', 'Tablet', '1 x 6 Film-Coated Tablets', 'CF8820', '2026-02-25', '2027-11-30', 480.00, 336.00, 30.0, 380, 5, 'ag-2', 'Rajesh Sharma', 'Mumbai & Thane', 'Micro Labs Zonal Office, Mulund', 'Rajesh Sharma', '+91 98112 55901', 'Micro Labs Ltd.', 'NEW RELEASE: 5 + 1 Free + Detailing Kit for Chest Physicians', true, true, now(), 'promotion', NULL)
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- SEED DATA: PROMOTIONS
-- =========================================================
INSERT INTO promotions (id, tablet_name, generic_composition, company, launched_by, role, contact_phone, contact_whatsapp, launch_headline, key_indications, intro_offer, ptr, mrp, sample_available, sample_stock, brochure_summary, target_doctors, territory, created_at) VALUES
('promo-1', 'Nexetra 10mg SR', 'Vonoprazan Fumarate Sustained Release (10mg)', 'Sun Pharma Industries', 'Pooja Deshmukh (Zonal MR)', 'MR', '+91 98450 11982', '919845011982', 'Next-Gen P-CAB Acid Relief: Faster Onset than Conventional PPIs', ARRAY['Refractory GERD & Nocturnal Acid Breakthrough','Erosive Esophagitis healing in under 4 weeks','H. Pylori Eradication dual/triple therapy regimen'], 'Launch Incentive: 10 + 2 Free Strips + Complimentary Doctor Sample Folders', 134.00, 195.00, true, 120, 'Vonoprazan provides sustained acid suppression above pH 4 for >24 hours with no food effect, outperforming traditional PPIs like omeprazole and pantoprazole.', 'Gastroenterologists, General Physicians, Consulting Surgeons', 'Mumbai, Thane, Navi Mumbai, Pune', now()),
('promo-2', 'Covifex 500mg', 'Faropenem Sodium Extended Release (500mg)', 'Micro Labs Ltd.', 'Rajesh Sharma (Hospital & Specialty MR)', 'MR', '+91 98112 55901', '919811255901', 'Oral Penem of Choice for Multi-Drug Resistant Community Respiratory Infections', ARRAY['Community-Acquired Pneumonia (CAP)','Complicated Upper & Lower Respiratory Tract Infections','Recurrent Acute Otitis Media & Sinusitis'], 'Introductory 5 + 1 Bonus Strip + Free CME Clinical Detailing Literature', 336.00, 480.00, true, 80, 'High stability against beta-lactamases and ESBL-producing pathogens with superior tolerability compared to standard carbapenems without requiring IV hospitalization.', 'Pulmonologists, Chest Physicians, ENT Specialists, Intensivists', 'Western Maharashtra & Mumbai', now()),
('promo-3', 'Lipocad-Gold 20', 'Rosuvastatin (20mg) + Aspirin (75mg) + Clopidogrel (75mg)', 'Apex Pharma Distributors (C&F for Torrent)', 'Apex Pharma Distributors Pvt. Ltd.', 'Agency', '+91 98230 44120', '919823044120', 'Triple-Action Fixed Dose Cardio Protection Capsule with Gold-Standard Bioavailability', ARRAY['Secondary Prevention of Acute Coronary Syndromes (ACS)','Post-PCI / Post-Stent Antiplatelet & Lipid Lowering','High-Risk Atherosclerotic Cardiovascular Disease'], 'Special Agency Bulk Launch: 20 + 3 Free + Priority Dispatch Guarantee', 210.00, 299.00, true, 65, 'Ensures optimal patient compliance by combining three crucial cardioprotective agents into a single once-daily capsule with enteric-coated pellets.', 'Cardiologists, Diabetologists, Internal Medicine Consultants', 'Pan-Maharashtra Distributors Hub', now())
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- SEED DATA: INQUIRIES
-- =========================================================
INSERT INTO inquiries (id, medical_store_name, pharmacist_name, phone, city, product_id, product_name, requested_qty, agency_id, agency_name, mr_name, mr_phone, notes, status, created_at) VALUES
('inq-1', 'Sanjivani Chemist & Druggist', 'Kailash Mehta', '+91 98221 00412', 'Mumbai', 'prod-1', 'Augmentin 625 Duo', 50, 'ag-1', 'Apex Pharma Distributors Pvt. Ltd.', 'Vikram Joshi (GSK Division)', '+91 98230 44120', 'Urgent stock needed for evening rush, please apply 10+1 scheme.', 'Confirmed', now() - interval '4 hours'),
('inq-2', 'Lifeline Medico', 'Dr. Rahul Patwardhan', '+91 98601 22849', 'Pune', 'prod-9', 'Nexetra 10mg SR', 20, 'ag-4', 'Pooja Deshmukh', 'Pooja Deshmukh (Direct MR)', '+91 98450 11982', 'Please also send 2 doctor trial samples for Dr. Hegde Clinic nearby.', 'Pending', now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;
