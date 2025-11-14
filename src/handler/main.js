/**
 * @Author Hatim Heffoudhi
 * Stream processor sync to Couchbase .::;
 */
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const {initCouchbaseBucket} = require('../util/couchbaseClient');

// Key builder: adjust to your DynamoDB PK/SK !!
function makeKey(keys) {
    const obj = unmarshall(keys);
    // Example: if table has only pk
    return obj.pk || obj.id || obj.ID;
    // If table has pk+sk, return `${obj.pk}#${obj.sk}`
}

/**
 * handler
 */
exports.handler = async (event) => {
    // singleton approach
    const collection = await initCouchbaseBucket();
    // reactive approach Async non-blocking api
    const tasks = event.Records.map(async (record) => {
        const { eventName, dynamodb } = record;
        const key = makeKey(dynamodb.Keys);

        if (eventName === "REMOVE") {
            try {
                await collection.remove(key);
                console.log(`Deleted document from Couchbase ${key}`);
            } catch (err) {
                if (!/document not found/i.test(err.message)) throw err;
            }
        } else if (dynamodb.NewImage) {
            const document = unmarshall(dynamodb.NewImage);
            await collection.upsert(key, document);
            console.log(`Upserted document on couchbase ${key}`);
        }
    });

    await Promise.allSettled(tasks);
    // process and return size of items proceed
    return `Processed ${event.Records.length} records`;
};