import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  const { data: invData } = await supabase.from('inventory').select('*');
  console.log('Inventory Table:', invData);

  const { data: menuData } = await supabase.from('menu_items').select('id, name').limit(5);
  console.log('Menu Items Sample:', menuData);
}

checkData();
