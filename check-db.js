require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('experiences').select('*').limit(1).then(d => {
  console.log(d.data ? Object.keys(d.data[0]) : d.error);
}).catch(console.error);
