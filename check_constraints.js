
import fs from 'fs';
const ACCESS_TOKEN = 'sbp_c36fb34d53e90f639746d3ebffcf8a73d83f8e90';
const PROJECT_ID = 'igbaydpamtpubqklsfnq';

async function checkConstraints() {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;
    const sql = `
        SELECT conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = 'public' AND conrelid = 'teams'::regclass;
    `;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
    });
    console.log(await response.text());
}
checkConstraints();
