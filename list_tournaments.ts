import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fwnzgvclfztemtpgeztr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bnpndmNsZnp0ZW10cGdlenRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzYwNzAsImV4cCI6MjA4ODcxMjA3MH0.5taNp43R55H42SkufV3uWg1fml0VujbH-bi1pRM3uIs'
const supabase = createClient(supabaseUrl, supabaseKey)

async function listTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
  
  if (error) {
    console.error('Error fetching tournaments:', error)
    return
  }
  
  console.log(JSON.stringify(data, null, 2))
}

listTournaments()
