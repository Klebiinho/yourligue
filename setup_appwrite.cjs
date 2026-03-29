const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
const fs = require('fs');

const PROJECT_ID = '69c8758900283c9071bb';
const ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const API_KEY = 'standard_50c8405e01eeaf6d3122139fa9591f011d3130f8d5334e7535ca1d7c164539bee25244ff80b8da242e375be90749e836e5740d4f35cfbe8a76fd50dd56539e94d379a3ac707f2a3db5b456226d02d5bb83dc22d8bc7236c9b902f4848282d06fd3fb60a4c505737b33b7b57bc190817f26e53b3278f1e837e1beead2446943e4';

const DATABASE_ID = '69c8776300116304c6e5';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function setup() {
    console.log('Starting Appwrite Database Setup on DB: ' + DATABASE_ID);
    const dbId = DATABASE_ID;
    const config = { databaseId: dbId, collections: {} };

    const collections = [
        { name: 'leagues', slug: 'leagues', attributes: [
            { key: 'name', type: 'string', required: true, size: 255 },
            { key: 'slug', type: 'string', required: false, size: 255 },
            { key: 'logo', type: 'string', required: false, size: 1000 },
            { key: 'user_id', type: 'string', required: false, size: 255 },
        ]},
        { name: 'teams', slug: 'teams', attributes: [
            { key: 'league_id', type: 'string', required: true, size: 255 },
            { key: 'name', type: 'string', required: true, size: 255 },
            { key: 'logo', type: 'string', required: false, size: 1000 },
            { key: 'group_name', type: 'string', required: false, size: 255 },
        ]},
        { name: 'players', slug: 'players', attributes: [
            { key: 'team_id', type: 'string', required: true, size: 255 },
            { key: 'league_id', type: 'string', required: true, size: 255 },
            { key: 'name', type: 'string', required: true, size: 255 },
            { key: 'number', type: 'integer', required: false },
            { key: 'position', type: 'string', required: false, size: 255 },
            { key: 'photo', type: 'string', required: false, size: 1000 },
            { key: 'is_captain', type: 'boolean', required: false, default: false },
        ]},
        { name: 'matches', slug: 'matches', attributes: [
            { key: 'league_id', type: 'string', required: true, size: 255 },
            { key: 'home_team_id', type: 'string', required: true, size: 255 },
            { key: 'away_team_id', type: 'string', required: true, size: 255 },
            { key: 'home_score', type: 'integer', required: false, default: 0 },
            { key: 'away_score', type: 'integer', required: false, default: 0 },
            { key: 'status', type: 'string', required: false, size: 100, default: 'scheduled' },
        ]},
        { name: 'ads', slug: 'ads', attributes: [
            { key: 'league_id', type: 'string', required: true, size: 255 },
            { key: 'title', type: 'string', required: true, size: 255 },
            { key: 'desktop_media_url', type: 'string', required: true, size: 1000 },
            { key: 'link_url', type: 'string', required: false, size: 1000 },
            { key: 'active', type: 'boolean', required: false, default: true },
        ]}
    ];

    for (const col of collections) {
        try {
            console.log(`Creating collection: ${col.name}...`);
            const collection = await databases.createCollection(dbId, ID.unique(), col.name, [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]);
            config.collections[col.slug] = collection.$id;
            console.log(`Collection ${col.name} created! ID: ${collection.$id}`);

            for (const attr of col.attributes) {
                console.log(`  Attribute: ${attr.key}...`);
                if (attr.type === 'string') {
                    await databases.createStringAttribute(dbId, collection.$id, attr.key, attr.size, attr.required, attr.default);
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(dbId, collection.$id, attr.key, attr.required, 0, 1000000, attr.default);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(dbId, collection.$id, attr.key, attr.required, attr.default);
                }
                await new Promise(r => setTimeout(r, 800)); // Rate limit safety
            }
        } catch (e) {
            console.error(`Error with collection ${col.name}:`, e.message);
        }
    }

    fs.writeFileSync('src/lib/appwrite_config.json', JSON.stringify(config, null, 2));
    console.log('Setup finished!');
}

setup();
