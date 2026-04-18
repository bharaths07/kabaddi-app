/* 
  KABADDIPULSE - TOURNAMENT DATA CURATION SQL
  Run this in your Supabase SQL Editor to replace dummy data with professional entries.
*/

-- 1. Clean up existing dummy tournaments
-- WARNING: This will delete existing tournaments. Ensure you have backups if needed.
TRUNCATE public.tournaments CASCADE;

-- 2. Insert 6 professional-grade tournaments
INSERT INTO public.tournaments (
  name, 
  city_state, 
  venue_name, 
  level, 
  start_date, 
  end_date, 
  status,
  created_at
) VALUES 
(
  'Haryana State Kabaddi Championship 2026',
  'Rohtak, Haryana',
  'Tau Devi Lal Stadium',
  'State',
  '2026-05-10 09:00:00+00',
  '2026-05-15 18:00:00+00',
  'upcoming',
  NOW()
),
(
  'Mahindra Pro Kabaddi Qualifier',
  'Pune, Maharashtra',
  'Shree Shiv Chhatrapati Sports Complex',
  'National',
  '2026-04-10 10:00:00+00',
  '2026-04-20 21:00:00+00',
  'ongoing',
  NOW()
),
(
  'National Rural Kabaddi League',
  'Jaipur, Rajasthan',
  'SMS Indoor Stadium',
  'National',
  '2026-06-01 08:00:00+00',
  '2026-06-10 20:00:00+00',
  'upcoming',
  NOW()
),
(
  'All India Inter-University Cup',
  'Varanasi, Uttar Pradesh',
  'BHU Grounds',
  'University',
  '2026-01-15 09:00:00+00',
  '2026-01-20 17:00:00+00',
  'completed',
  NOW()
),
(
  'Telangana State Kabaddi Open',
  'Hyderabad, Telangana',
  'Gachibowli Indoor Stadium',
  'State',
  '2026-02-05 10:00:00+00',
  '2026-02-12 19:00:00+00',
  'completed',
  NOW()
),
(
  'Tamil Nadu Traditional Mat Trophy',
  'Madurai, Tamil Nadu',
  'Race Course Stadium',
  'Regional',
  '2026-07-20 09:00:00+00',
  '2026-07-25 18:00:00+00',
  'upcoming',
  NOW()
);

-- Note: 'ongoing', 'upcoming', 'completed' status strings match the UI logic.
