import { createClient } from '@supabase/supabase-js'

// Using process.env format common in Vite projects or local dev
const supabaseUrl = 'https://fwnzgvclfztemtpgeztr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bnpndmNsZnp0ZW10cGdlenRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzYwNzAsImV4cCI6MjA4ODcxMjA3MH0.5taNp43R55H42SkufV3uWg1fml0VujbH-bi1pRM3uIs'

const supabase = createClient(supabaseUrl, supabaseKey)

const curatedTournaments = [
  {
    name: "Haryana State Kabaddi Championship 2026",
    city_state: "Rohtak, Haryana",
    venue_name: "Tau Devi Lal Stadium",
    level: "State",
    start_date: "2026-05-10T09:00:00Z",
    end_date: "2026-05-15T18:00:00Z",
    status: "upcoming"
  },
  {
    name: "Mahindra Pro Kabaddi Qualifier",
    city_state: "Pune, Maharashtra",
    venue_name: "Shree Shiv Chhatrapati Sports Complex",
    level: "National",
    start_date: "2026-04-10T10:00:00Z",
    end_date: "2026-04-20T21:00:00Z",
    status: "ongoing"
  },
  {
    name: "National Rural Kabaddi League",
    city_state: "Jaipur, Rajasthan",
    venue_name: "SMS Indoor Stadium",
    level: "National",
    start_date: "2026-06-01T08:00:00Z",
    end_date: "2026-06-10T20:00:00Z",
    status: "upcoming"
  },
  {
    name: "All India Inter-University Cup",
    city_state: "Varanasi, Uttar Pradesh",
    venue_name: "BHU Grounds",
    level: "University",
    start_date: "2026-01-15T09:00:00Z",
    end_date: "2026-01-20T17:00:00Z",
    status: "completed"
  },
  {
    name: "Telangana State Kabaddi Open",
    city_state: "Hyderabad, Telangana",
    venue_name: "Gachibowli Indoor Stadium",
    level: "State",
    start_date: "2026-02-05T10:00:00Z",
    end_date: "2026-02-12T19:00:00Z",
    status: "completed"
  },
  {
    name: "Tamil Nadu Traditional Mat Trophy",
    city_state: "Madurai, Tamil Nadu",
    venue_name: "Race Course Stadium",
    level: "Regional",
    start_date: "2026-07-20T09:00:00Z",
    end_date: "2026-07-25T18:00:00Z",
    status: "upcoming"
  }
]

async function seed() {
  console.log("Cleaning up low-quality tournament data...")
  const { error: deleteError } = await supabase
    .from('tournaments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

  if (deleteError) {
    console.error("Error cleaning up tournaments:", deleteError)
    return
  }

  console.log("Inserting 6 curated professional tournaments...")
  const { error: insertError } = await supabase
    .from('tournaments')
    .insert(curatedTournaments)

  if (insertError) {
    console.error("Error inserting curated tournaments:", insertError)
    return
  }

  console.log("Data curation complete. 6 professional entries added.")
}

seed()
