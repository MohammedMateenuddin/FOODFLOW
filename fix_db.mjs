import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read local env
const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function fix() {
  console.log("Updating database...");
  const { data, error } = await supabase
    .from('listings')
    .update({ food_name: 'Premium Buffet Surplus' })
    .eq('food_name', 'test');
    
  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Successfully replaced "test" with realistic data!');
  }
}

fix();
