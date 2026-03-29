import { createClient } from '@supabase/supabase-js';
import sitemapData from '../src/sitemap_data.json';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Static Routes from our sitemap_data.json (simulated or imported)
    const staticRoutes = [
        '/', '/blog', '/duvidas', '/leagues', '/auth', '/sitemap',
        '/politica-de-privacidade', '/termos-de-uso', '/sobre-nos', '/contato'
    ];

    // 2. Extract dynamic content pages (Blog, FAQ, Glossary)
    const contentRoutes = [];
    ['Posts', 'Alfabeto', 'Glossario', 'Servicos'].forEach(category => {
        if (sitemapData[category]) {
            sitemapData[category].forEach(item => {
                contentRoutes.push(item.path);
            });
        }
    });

    // 3. Fetch Dynamic Data
    const { data: leagues } = await supabase.from('leagues').select('slug, updated_at').limit(500);
    const { data: players } = await supabase.from('players').select('slug, updated_at').limit(500);
    const { data: matches } = await supabase.from('matches').select('id, updated_at').limit(500);

    // 4. Generate XML
    const base_url = 'https://yourligue.vercel.app';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add Statics
    staticRoutes.forEach(route => {
        xml += `  <url>\n    <loc>${base_url}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Add Content Pages (The "Questions" for SEO)
    contentRoutes.forEach(route => {
        xml += `  <url>\n    <loc>${base_url}${route}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Add Leagues and Locations
    leagues?.forEach(item => {
        xml += `  <url>\n    <loc>${base_url}/${item.slug}</loc>\n    <lastmod>${new Date(item.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        xml += `  <url>\n    <loc>${base_url}/${item.slug}/localizacao</loc>\n    <lastmod>${new Date(item.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    // Add Players
    players?.forEach(item => {
        if (item.slug) {
            xml += `  <url>\n    <loc>${base_url}/${item.slug}/player</loc>\n    <lastmod>${new Date(item.updated_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }
    });

    // Add Matches
    matches?.forEach(item => {
        xml += `  <url>\n    <loc>${base_url}/match/${item.id}</loc>\n    <lastmod>${new Date(item.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
}
