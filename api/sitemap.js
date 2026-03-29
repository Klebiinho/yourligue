import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Static Routes from our sitemap_data.json (simulated or imported)
    // In a real serverless env, we'd bundle the JSON
    const staticRoutes = [
        '/', '/blog', '/duvidas', '/leagues', '/auth', '/sitemap',
        '/politica-de-privacidade', '/termos-de-uso', '/sobre-nos', '/contato'
    ];

    // 2. Fetch Dynamic Leagues
    const { data: leagues } = await supabase.from('leagues').select('slug, updated_at');
    
    // 3. Fetch Dynamic Teams (if public)
    const { data: teams } = await supabase.from('teams').select('id, name, updated_at');

    // 4. Generate XML
    const base_url = 'https://yourligue.vercel.app';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add Statics
    staticRoutes.forEach(route => {
        xml += `  <url>\n    <loc>${base_url}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Add Leagues
    leagues?.forEach(league => {
        xml += `  <url>\n    <loc>${base_url}/${league.slug}</loc>\n    <lastmod>${new Date(league.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    });

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
}
