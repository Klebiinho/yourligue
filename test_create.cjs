const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

const PROJECT_ID = '69c8758900283c9071bb';
const ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const API_KEY = 'standard_50c8405e01eeaf6d3122139fa9591f011d3130f8d5334e7535ca1d7c164539bee25244ff80b8da242e375be90749e836e5740d4f35cfbe8a76fd50dd56539e94d379a3ac707f2a3db5b456226d02d5bb83dc22d8bc7236c9b902f4848282d06fd3fb60a4c505737b33b7b57bc190817f26e53b3278f1e837e1beead2446943e4';
const DATABASE_ID = '69c87763001163004c6e5';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function test() {
    try {
        console.log('Testing collection creation...');
        const col = await databases.createCollection(DATABASE_ID, ID.unique(), 'test_col', [
            Permission.read(Role.any()),
        ]);
        console.log('Created!', col.$id);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
test();
