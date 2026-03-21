import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function checkData() {
  const { data: invData, error: invErr } = await supabase.from('inventory').select('*');
  console.log('Inventory Table:', invData, 'Error:', invErr);

  const { data: menuData, error: menuErr } = await supabase.from('menu_items').select('id, name').limit(15);
  console.log('Menu Items Sample:', menuData, 'Error:', menuErr);
}

checkData();
