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

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('Verifying player claiming logic...')
  
  // Test pardeep-narwal claim state
  const { data, error } = await supabase.from('players').select('is_claimed, claimed_by').eq('slug', 'pardeep-narwal').maybeSingle()
  
  if (error) {
     console.error('Verification failed:', error.message)
     return
  }
  
  console.log('Current state for pardeep-narwal:', data)
  console.log('Verification script completed.')
}

verify()
