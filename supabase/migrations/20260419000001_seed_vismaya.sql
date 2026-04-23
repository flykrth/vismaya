-- Seed Data for Vismaya Camp

-- 1. Create a Mock Parent (bypassing auth.users for testing, or assume we create it manually)
-- Normally parents.id references auth.users(id). Since auth.users is managed by Supabase Auth,
-- we will just insert a dummy user if foreign key checks are deferred, but since it's a hard FK,
-- you MUST create a user in the Supabase Auth UI first with the UUID '11111111-1111-1111-1111-111111111111'.
-- Alternatively, for this seed script to run cleanly WITHOUT auth setup, we temporarily drop the FK constraint, 
-- insert the mock parent, and then you should restore it later for production.

ALTER TABLE parents DROP CONSTRAINT parents_id_fkey;

INSERT INTO parents (id, full_name, phone_number) VALUES
('11111111-1111-1111-1111-111111111111', 'Mock Parent (Tester)', '555-0100')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Mock Campers for the Mock Parent
-- Note: age_category is auto-calculated by the trigger we built!
INSERT INTO campers (id, parent_id, full_name, date_of_birth) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Timmy Tester (Age 9)', '2017-05-15'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Sarah Tester (Age 13)', '2013-08-20'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Alex Tester (Age 16)', '2010-02-10')
ON CONFLICT (id) DO NOTHING;

-- 3. Create 5 Mock Workshops
INSERT INTO workshops (id, title, description, allowed_age_categories) VALUES
('55555555-5555-5555-5555-555555555551', 'Wilderness Survival Basics', 'Learn to build a shelter, start a fire without matches, and identify edible plants.', ARRAY['sub-junior', 'junior']::age_category_type[]),
('55555555-5555-5555-5555-555555555552', 'Advanced Navigation & Trekking', 'Navigate the Sierra Nevada using only a compass and the stars. A rigorous physical challenge.', ARRAY['senior']::age_category_type[]),
('55555555-5555-5555-5555-555555555553', 'Mindful Art in Nature', 'Create beautiful landscapes using natural materials and watercolor. Includes daily meditation.', ARRAY['sub-junior', 'junior', 'senior']::age_category_type[]),
('55555555-5555-5555-5555-555555555554', 'Campfire Storytelling & Folklore', 'Discover local legends and learn the art of captivating an audience around the night fire.', ARRAY['sub-junior', 'junior']::age_category_type[]),
('55555555-5555-5555-5555-555555555555', 'White Water Rafting Leadership', 'Take charge on the rapids. Learn teamwork, safety protocols, and dynamic leadership skills.', ARRAY['junior', 'senior']::age_category_type[])
ON CONFLICT (id) DO NOTHING;

-- 4. Create Schedules for Workshops
INSERT INTO schedules (id, workshop_id, slot_label, start_time, end_time, venue, max_capacity, current_enrollment) VALUES
-- Survival Basics (2 schedules)
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'A', '2026-07-15 09:00:00+00', '2026-07-15 12:00:00+00', 'North Woods', 15, 0),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555551', 'B', '2026-07-16 13:00:00+00', '2026-07-16 16:00:00+00', 'North Woods', 15, 0),

-- Advanced Navigation (1 schedule)
('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555552', 'A', '2026-07-17 06:00:00+00', '2026-07-17 18:00:00+00', 'Sierra Peak Trail', 10, 0),

-- Mindful Art (3 schedules)
('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555553', 'C', '2026-07-18 10:00:00+00', '2026-07-18 12:00:00+00', 'Lakeview Pavilion', 20, 0),
('66666666-6666-6666-6666-666666666665', '55555555-5555-5555-5555-555555555553', 'D', '2026-07-19 10:00:00+00', '2026-07-19 12:00:00+00', 'Lakeview Pavilion', 20, 0),
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555553', 'B', '2026-07-20 10:00:00+00', '2026-07-20 12:00:00+00', 'Lakeview Pavilion', 2, 2), -- Full capacity!

-- Storytelling (1 schedule)
('66666666-6666-6666-6666-666666666667', '55555555-5555-5555-5555-555555555554', 'C', '2026-07-15 20:00:00+00', '2026-07-15 22:00:00+00', 'Main Firepit', 30, 0),

-- Rafting (1 schedule)
('66666666-6666-6666-6666-666666666668', '55555555-5555-5555-5555-555555555555', 'D', '2026-07-21 08:00:00+00', '2026-07-21 16:00:00+00', 'River Basecamp', 12, 0)
ON CONFLICT (id) DO NOTHING;

-- Re-enable the FK constraint if you plan to use Supabase Auth later
-- ALTER TABLE parents ADD CONSTRAINT parents_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
