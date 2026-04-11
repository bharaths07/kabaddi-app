import { supabase } from './src/shared/lib/supabase';

async function runChecks() {
  const tables = ['news_posts', 'kabaddi_matches'];
  for (const table of tables) {
    console.log(`\n--- Checking ${table} table ---`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`ERROR ${table}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`COLUMNS in ${table}: ${JSON.stringify(Object.keys(data[0]))}`);
    } else {
      console.log(`${table} is empty.`);
      if (table === 'news_posts') {
        const { error: e2 } = await supabase.from(table).select('title,content,created_at').limit(0);
        if (e2) console.log(`Missing news columns: ${e2.message}`);
        else console.log(`News columns OK`);
      }
    }
  }
}

runChecks();
