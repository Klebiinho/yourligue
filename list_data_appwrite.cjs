const { Client, Databases } = require('node-appwrite');

const PROJECT_ID = '69c8758900283c9071bb';
const ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const API_KEY = 'standard_50c8405e01eeaf6d3122139fa9591f011d3130f8d5334e7535ca1d7c164539bee25244ff80b8da242e375be90749e836e5740d4f35cfbe8a76fd50dd56539e94d379a3ac707f2a3db5b456226d02d5bb83dc22d8bc7236c9b902f4848282d06fd3fb60a4c505737b33b7b57bc190817f26e53b3278f1e837e1beead2446943e4';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function check() {
    try {
        const dbs = await databases.list();
        for (const db of dbs.databases) {
            console.log(`Database: ${db.name} (${db.$id})`);
            const collections = await databases.listCollections(db.$id);
            for (const col of collections.collections) {
                const docs = await databases.listDocuments(db.$id, col.$id);
                console.log(`  Collection: ${col.name} (${col.$id}) - ${docs.total} documents`);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
