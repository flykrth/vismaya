-- Add speaker and learning outcome fields to workshops table

ALTER TABLE workshops
ADD COLUMN speaker_name TEXT NOT NULL DEFAULT 'TBD',
ADD COLUMN speaker_title TEXT NOT NULL DEFAULT 'Instructor',
ADD COLUMN learning_outcome TEXT NOT NULL DEFAULT 'Gain valuable skills and knowledge';

-- Update existing workshops with specific details
UPDATE workshops SET
  speaker_name = 'Marcus Reed',
  speaker_title = 'Wilderness Survival Expert',
  learning_outcome = 'Master essential survival skills including shelter building, fire starting, and plant identification'
WHERE id = '55555555-5555-5555-5555-555555555551';

UPDATE workshops SET
  speaker_name = 'Dr. James Chen',
  speaker_title = 'Master Navigator & Geologist',
  learning_outcome = 'Navigate complex terrain using compass and celestial navigation while understanding the landscape'
WHERE id = '55555555-5555-5555-5555-555555555552';

UPDATE workshops SET
  speaker_name = 'Sophia Meyer',
  speaker_title = 'Artist & Mindfulness Coach',
  learning_outcome = 'Express creativity through nature-inspired art while cultivating inner peace and presence'
WHERE id = '55555555-5555-5555-5555-555555555553';

UPDATE workshops SET
  speaker_name = 'Elena Rodriguez',
  speaker_title = 'Digital Narrator & Guide',
  learning_outcome = 'Master the art of storytelling and connect deeply with audiences through authentic narratives'
WHERE id = '55555555-5555-5555-5555-555555555554';

UPDATE workshops SET
  speaker_name = 'Captain Alex Thompson',
  speaker_title = 'Rafting & Leadership Expert',
  learning_outcome = 'Develop leadership skills, teamwork, and water safety while conquering challenging rapids'
WHERE id = '55555555-5555-5555-5555-555555555555';
