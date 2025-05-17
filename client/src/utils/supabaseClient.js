// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kaujmrtvurpylnpoudqp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdWptcnR2dXJweWxucG91ZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTM1NjgsImV4cCI6MjA2Mjk4OTU2OH0.tfSE3ESSSyQzmeCe9WBWQarSFicJoQQdynXWEP-YPTg'; // public key, safe to expose on frontend

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// automatically create anonymous session if none exists
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
  
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous session creation failed:', error.message);
      } else {
        console.log('Anonymous session created');
      }
    } else {
      console.log('Supabase session active');
    }
  })();