import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://skletsjrrejlmgseczan.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbGV0c2pycmVqbG1nc2VjemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDAzMjIsImV4cCI6MjA5Mzg3NjMyMn0.o40dO4IZh__UZyVkmolquGg3KN9tdC1v-Xzikbg-2M4';

export const supabase = createClient(supabaseUrl, supabaseKey);
