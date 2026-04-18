import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking players table...')
  const { data, error } = await supabase.from('players').select('*').limit(1)
  if (error) {
    console.error('Error fetching players:', error.message)
  } else if (data && data.length > 0) {
    console.log('Columns in players table:', Object.keys(data[0]))
  } else {
    console.log('Players table is empty or could not fetch columns.')
  }
}

checkSchema()
