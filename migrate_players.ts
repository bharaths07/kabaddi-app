import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Function to read .env file without dotenv
function getEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}
  content.split('\n').forEach(line => {
    const [key, ...val] = line.split('=')
    if (key && val) env[key.trim()] = val.join('=').trim().replace(/^"(.*)"$/, '$1')
  })
  return env
}

const env = getEnv()
const supabaseUrl = env['VITE_SUPABASE_URL'] || ''
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'] || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  console.log('Starting migration...')
  
  // Note: Standard Anon key cannot run arbitrary SQL via RPC or REST.
  // We have to assume the user will run the SQL or we try to use the REST API 
  // to see if we can at least probe the columns.
  
  try {
    const { data, error } = await supabase.from('players').select('is_claimed').limit(1)
    if (error && error.message.includes('column "is_claimed" does not exist')) {
      console.log('Columns is_claimed and claimed_by are missing.')
      console.log('Please run the following SQL in your Supabase SQL Editor:')
      console.log(`
        ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;
        ALTER TABLE public.players ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
      `)
    } else if (error) {
      console.error('Error probing players table:', error.message)
    } else {
      console.log('Columns is_claimed already exists.')
    }
  } catch (e) {
    console.error('Migration probe failed:', e)
  }
}

migrate()
