const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
  console.log('Fetching users...');
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users list:');
    console.log(users);
  }
}

main();
