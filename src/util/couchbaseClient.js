// couchbaseClient.js
const couchbase = require('couchbase');
// Get Couchbase information
const {COUCHBASE_HOST, COUCHBASE_BUCKET, COUCHBASE_SCOPE,COUCHBASE_COLLECTION,COUCHBASE_USERNAME, COUCHBASE_PASSWORD} = process.env;

let collection = null; // Cached bucket instance
console.log(COUCHBASE_HOST, COUCHBASE_BUCKET,COUCHBASE_SCOPE,COUCHBASE_COLLECTION, COUCHBASE_USERNAME);

// Function to initialize Couchbase and get the bucket
async function initCouchbaseBucket() {
    if (collection) {
        console.log('Bucket already initialized...');
        return collection;
    }
    try {
        // Initialize cluster
        console.log('Initializing Couchbase cluster and bucket...');
        const cluster = await couchbase.connect(`couchbases://${COUCHBASE_HOST}`, {
            username: COUCHBASE_USERNAME,
            password: COUCHBASE_PASSWORD
        });

        // Cache the bucket for future calls
        collection = cluster.bucket(COUCHBASE_BUCKET).scope(COUCHBASE_SCOPE).collection(COUCHBASE_COLLECTION);
        console.log('Couchbase bucket initialized.');
    } catch (error) {
        console.error('Error initializing Couchbase bucket:', error);
        throw error;
    }
    return collection;
}

// Export the function to be used in other modules
module.exports = {initCouchbaseBucket};
