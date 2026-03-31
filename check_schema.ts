import { supabase } from './src/shared/lib/supabase';

async function checkSchema() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching tournament:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in tournaments table:', Object.keys(data[0]));
  } else {
    console.log('Tournaments table is empty, cannot infer columns from select *');
    // Try to get one with just id
     const { data: d2 } = await supabase.from('tournaments').select('id').limit(1);
     console.log('Select id test:', d2);
  }
}

checkSchema();
