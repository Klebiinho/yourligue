import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://vlvbalmntwccmafobxwk.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdmJhbG1udHdjY21hZm9ieHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTA1NzksImV4cCI6MjA4ODc2NjU3OX0.BYRN0aI-ttfTXukrbODGEGd3mGcHSysso_ncrRDhY8s'
);

async function test() {
    const { data, error } = await supabase.from('leagues').select('*').limit(1);
    console.log('Columns test:', data, 'Error:', error);
}

test();
