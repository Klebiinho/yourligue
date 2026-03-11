const PAT = 'sbp_599b98bf2e66c8251beb4f9b6959b5b30e40c8dc';
const PROJECT_REF = 'vlvbalmntwccmafobxwk';

const sql = `
ALTER TABLE league_settings ADD COLUMN IF NOT EXISTS default_half_length integer default 45;
`;

async function executeSql() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('SQL Execution failed:', err);
        } else {
            console.log('Default half length column added successfully!');
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

executeSql();
