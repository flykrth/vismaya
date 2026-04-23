-- Final test seed data.
-- Replace these workshops/schedules with real public data later.

-- Workshops
INSERT INTO workshops (
  id,
  title,
  description,
  speaker_name,
  speaker_title,
  learning_outcome,
  allowed_age_categories
) VALUES
(
  '55555555-5555-5555-5555-555555555551',
  'Forest Survival Foundations',
  'Hands-on basics of shelter, knots, and outdoor safety.',
  'Mira Sen',
  'Outdoor Educator',
  'Campers learn practical survival routines they can apply safely in guided settings.',
  ARRAY['sub-junior', 'junior']::age_category_type[]
),
(
  '55555555-5555-5555-5555-555555555552',
  'Trail Navigation Lab',
  'Map-and-compass challenges with route strategy exercises.',
  'Rahul Dutta',
  'Expedition Guide',
  'Campers build confidence navigating checkpoints and reading terrain cues.',
  ARRAY['junior', 'senior']::age_category_type[]
),
(
  '55555555-5555-5555-5555-555555555553',
  'Creative Nature Studio',
  'Art-making with natural textures, sketching, and mindful observation.',
  'Aanya Roy',
  'Art Mentor',
  'Campers practice creative expression and visual storytelling from nature prompts.',
  ARRAY['sub-junior', 'junior', 'senior']::age_category_type[]
),
(
  '55555555-5555-5555-5555-555555555554',
  'Campfire Story Craft',
  'Story structure, voice, and performance circles around a guided campfire setting.',
  'Elena Cruz',
  'Storytelling Coach',
  'Campers improve public speaking through short-form narrative practice.',
  ARRAY['sub-junior', 'junior']::age_category_type[]
),
(
  '55555555-5555-5555-5555-555555555555',
  'River Team Leadership',
  'Team drills and safety-first decision making for water activity scenarios.',
  'A. Thompson',
  'Water Safety Lead',
  'Campers strengthen communication and leadership in dynamic group tasks.',
  ARRAY['junior', 'senior']::age_category_type[]
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  speaker_name = EXCLUDED.speaker_name,
  speaker_title = EXCLUDED.speaker_title,
  learning_outcome = EXCLUDED.learning_outcome,
  allowed_age_categories = EXCLUDED.allowed_age_categories;

-- Schedules
-- Public UI shows only slot labels (A-D).
INSERT INTO schedules (
  id,
  workshop_id,
  slot_label,
  start_time,
  end_time,
  venue,
  max_capacity,
  current_enrollment
) VALUES
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'A', '2026-07-15 09:00:00+00', '2026-07-15 12:00:00+00', 'North Woods', 15, 0),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555551', 'B', '2026-07-16 13:00:00+00', '2026-07-16 16:00:00+00', 'North Woods', 15, 0),
('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555552', 'A', '2026-07-17 06:00:00+00', '2026-07-17 18:00:00+00', 'Sierra Trailhead', 12, 0),
('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555553', 'C', '2026-07-18 10:00:00+00', '2026-07-18 12:00:00+00', 'Lake Pavilion', 20, 0),
('66666666-6666-6666-6666-666666666665', '55555555-5555-5555-5555-555555555553', 'D', '2026-07-19 10:00:00+00', '2026-07-19 12:00:00+00', 'Lake Pavilion', 20, 0),
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555554', 'C', '2026-07-20 20:00:00+00', '2026-07-20 22:00:00+00', 'Main Firepit', 30, 0),
('66666666-6666-6666-6666-666666666667', '55555555-5555-5555-5555-555555555555', 'D', '2026-07-21 08:00:00+00', '2026-07-21 16:00:00+00', 'River Basecamp', 12, 0)
ON CONFLICT (id) DO UPDATE SET
  workshop_id = EXCLUDED.workshop_id,
  slot_label = EXCLUDED.slot_label,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  venue = EXCLUDED.venue,
  max_capacity = EXCLUDED.max_capacity,
  current_enrollment = EXCLUDED.current_enrollment;
