const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually so we don't need dotenv
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const donors = [
  { name: 'Hotel Taj', type: 'hotel', address: 'Colaba, Mumbai', lat: 18.9220, lng: 72.8332, phone: '+91-9876543210', badge_tier: 'flagship', badge_active: true },
  { name: 'ITC Maratha', type: 'hotel', address: 'Andheri East, Mumbai', lat: 19.1030, lng: 72.8722, phone: '+91-9876543211', badge_tier: 'premium', badge_active: true },
  { name: 'JW Marriott', type: 'hotel', address: 'Juhu, Mumbai', lat: 19.1016, lng: 72.8262, phone: '+91-9876543212', badge_tier: 'verified', badge_active: true },
  { name: 'Cafe Leopold', type: 'restaurant', address: 'Colaba Causeway, Mumbai', lat: 18.9230, lng: 72.8315, phone: '+91-9876543213' },
  { name: 'Gourmet Catering', type: 'caterer', address: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, phone: '+91-9876543214', badge_tier: 'verified', badge_active: true },
  { name: 'The Leela', type: 'hotel', address: 'Andheri East, Mumbai', lat: 19.1075, lng: 72.8741, phone: '+91-9876543215', badge_tier: 'premium', badge_active: true },
  { name: 'Peshawri', type: 'restaurant', address: 'Andheri East, Mumbai', lat: 19.1031, lng: 72.8725, phone: '+91-9876543216' },
  { name: 'Oberoi Mall Food Court', type: 'restaurant', address: 'Goregaon East, Mumbai', lat: 19.1713, lng: 72.8596, phone: '+91-9876543217' }
];

const receivers = [
  { name: 'Robin Hood Army', type: 'ngo', address: 'Dharavi, Mumbai', lat: 19.0380, lng: 72.8538, capacity: 500, current_demand: 250, beneficiary_count: 500 },
  { name: 'Annamrita Foundation', type: 'ngo', address: 'Tardeo, Mumbai', lat: 18.9710, lng: 72.8122, capacity: 1000, current_demand: 800, beneficiary_count: 1200 },
  { name: 'Feeding India', type: 'ngo', address: 'Powai, Mumbai', lat: 19.1197, lng: 72.9051, capacity: 700, current_demand: 400, beneficiary_count: 750 },
  { name: 'SMILE Foundation', type: 'ngo', address: 'Malad West, Mumbai', lat: 19.1843, lng: 72.8360, capacity: 300, current_demand: 150, beneficiary_count: 350 },
  { name: 'Local Orphanage', type: 'shelter', address: 'Vile Parle, Mumbai', lat: 19.0984, lng: 72.8366, capacity: 100, current_demand: 60, beneficiary_count: 100 },
  { name: 'Community Kitchen', type: 'kitchen', address: 'Kurla West, Mumbai', lat: 19.0682, lng: 72.8805, capacity: 400, current_demand: 200, beneficiary_count: 450 }
];

const partners = [
  { name: 'GreenGas Energy Pvt Ltd', type: 'biogas', address: 'Sector 62, Noida, UP', lat: 28.6270, lng: 77.3650, capacity_kg_per_day: 1000, current_intake: 120, accepts_food_types: ['cooked','raw','bakery','packaged'], contact_phone: '+91-9876543210' },
  { name: 'BioFuel India', type: 'biogas', address: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500, capacity_kg_per_day: 800, current_intake: 200, accepts_food_types: ['cooked','raw','bakery'], contact_phone: '+91-9876543211' },
  { name: 'EcoRecycle Solutions', type: 'compost', address: 'Andheri East, Mumbai', lat: 19.1136, lng: 72.8697, capacity_kg_per_day: 600, current_intake: 110, accepts_food_types: ['cooked','raw','packaged'], contact_phone: '+91-9876543220' }
];

async function seed() {
  console.log('Seeding donors...');
  for (const d of donors) {
    const { error } = await supabase.from('donors').insert(d);
    if (error) console.error('Error inserting donor:', error.message);
  }
  
  console.log('Seeding receivers...');
  for (const r of receivers) {
    const { error } = await supabase.from('receivers').insert(r);
    if (error) console.error('Error inserting receiver:', error.message);
  }

  console.log('Seeding partners...');
  for (const p of partners) {
    const { error } = await supabase.from('valorization_partners').insert(p);
    if (error) console.error('Error inserting partner:', error.message);
  }

  console.log('Seeding complete!');
}

seed();
