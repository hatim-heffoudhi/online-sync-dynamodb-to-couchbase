# 🌀 online-sync-dynamodb-to-couchbase

**online-sync-dynamodb-to-couchbase** is a **serverless data synchronization service** that streams live changes from **Amazon DynamoDB** to **Couchbase** in near real-time.

It leverages **AWS Lambda** (Node.js runtime) as a **DynamoDB Stream consumer** and pushes inserts, updates, and deletes to a Couchbase cluster. This solution is designed for **low-latency synchronization**, **event-driven data replication**, and **hybrid cloud migration** use cases.

---

## 🚀 Key Features

- **Near Real-Time Sync:** Captures change events from DynamoDB Streams and propagates them to Couchbase immediately.  
- **Fully Serverless:** Uses AWS SAM to deploy Lambda, SQS (DLQ), and required IAM permissions.  
- **Fault-Tolerant:** Failed batches are redirected to an SQS Dead-Letter Queue for analysis or replay.  
- **Customizable Mapping:** Extend the Lambda handler to transform or enrich records before writing to Couchbase.  
- **Secure Configuration:** Credentials and connection details are passed via environment variables, not hard-coded.  
- **Portable Deployment:** Easily redeploy across environments (dev, staging, prod) with different stream ARNs or Couchbase settings.

---

## 🧱 Architecture Overview

```

DynamoDB Table
│
▼
DynamoDB Stream  ──►  AWS Lambda (StreamProcessor)
│
├── Transform / Filter (optional)
▼
Couchbase Cluster (Bucket / Scope / Collection)
│
▼
SQS Dead-Letter Queue (on failure)

```

---

## 🧩 Project Structure

```

online-sync-dynamodb-to-couchbase/
├── src/
│   └── handler/
│       └── main.js            # Lambda entry point (Node.js 18.x)
├── template.yaml              # AWS SAM template (CloudFormation)
├── package.json               # Project dependencies & scripts
├── LICENSE
└── README.md

````

---

## ⚙️ AWS Resources Defined

All resources are declared in `template.yaml` using the **AWS Serverless Application Model (SAM)**.

| Resource | Type | Description |
|-----------|------|-------------|
| `StreamProcessor` | `AWS::Serverless::Function` | Lambda that consumes the DynamoDB Stream and writes to Couchbase. |
| `StreamDLQ` | `AWS::SQS::Queue` | Dead-Letter Queue for failed batches (recommended best practice). |
| `DynamoDB Stream` | (External Input) | Existing DynamoDB stream ARN passed as parameter. |

---

## 🧾 Template Parameters

| Parameter | Description | Default |
|------------|-------------|----------|
| `DynamoDBStreamArn` | ARN of the DynamoDB Stream to consume | *(required)* |
| `CouchbaseHost` | Couchbase hostname or connection string | *(required)* |
| `CouchbaseBucket` | Target Couchbase bucket name | `EmiRed` |
| `CouchbaseScope` | Couchbase scope name | `_default` |
| `CouchbaseCollection` | Couchbase collection name | `_default` |
| `CouchbaseUsername` | Couchbase username | `Administrator` |
| `CouchbasePassword` | Couchbase password | *(NoEcho)* |

---

## 🧠 Requirements

Before deploying, make sure you have:

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Docker](https://hub.docker.com/search/?type=edition&offering=community) (for local builds/emulation)
- [Node.js 18+](https://nodejs.org)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- Access to a **DynamoDB table with streams enabled**
- Access to a **Couchbase cluster** (Cloud or self-managed)

---

## 🏗️ Build and Deploy

You can deploy the application to AWS using the **SAM CLI**:

```bash
# 1. Build your Lambda package
sam build

# 2. Deploy (guided for first time)
sam deploy --guided
````

During the guided deployment, SAM will prompt for:

* **Stack Name** (e.g., `online-sync-dynamodb-to-couchbase`)
* **AWS Region**
* **DynamoDB Stream ARN**
* **Couchbase connection info**
* IAM role confirmation (`CAPABILITY_IAM`)

Your deployment will create:

* Lambda function subscribed to your DynamoDB Stream
* SQS Dead-Letter Queue
* CloudFormation stack with all resources

After deployment, the **API Gateway endpoint (if any)** or stack outputs will be printed to the terminal.

---

## 🧪 Local Development & Testing

### 1. Install dependencies

```bash
npm install
```

### 2. Run Jest tests

```bash
npm test
```

### 3. Build the Lambda locally

```bash
npm run build
```

### 4. Run locally with SAM

You can invoke your Lambda function locally using DynamoDB Stream event samples:

```bash
sam local invoke StreamProcessor \
  --event events/sample-dynamodb-stream.json \
  --env-vars env.json
```

---

## ⚡ Environment Variables

| Variable               | Description                             |
| ---------------------- | --------------------------------------- |
| `COUCHBASE_HOST`       | Couchbase connection string or hostname |
| `COUCHBASE_BUCKET`     | Couchbase bucket name                   |
| `COUCHBASE_SCOPE`      | Couchbase scope                         |
| `COUCHBASE_COLLECTION` | Couchbase collection                    |
| `COUCHBASE_USERNAME`   | Couchbase admin username                |
| `COUCHBASE_PASSWORD`   | Couchbase password                      |

Example `env.json` for local testing:

```json
{
  "StreamProcessor": {
    "COUCHBASE_HOST": "couchbase://localhost",
    "COUCHBASE_BUCKET": "EmiRed",
    "COUCHBASE_SCOPE": "_default",
    "COUCHBASE_COLLECTION": "_default",
    "COUCHBASE_USERNAME": "Administrator",
    "COUCHBASE_PASSWORD": "password"
  }
}
```

---

## 🔍 Monitoring and Logs

To fetch and tail logs from the deployed Lambda:

```bash
sam logs -n StreamProcessor --stack-name online-sync-dynamodb-to-couchbase --tail
```

Or view directly in **CloudWatch Logs** from the AWS Console.

Failed batches are automatically sent to the **SQS DLQ** (`StreamDLQ`), visible under **SQS > Queues**.

---

## 🧰 Useful NPM Scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run build`      | Rebuild Lambda with SAM             |
| `npm run test`       | Run unit tests with Jest            |
| `npm run start:api`  | Start the API locally with SAM      |
| `npm run stop:api`   | Stop local Docker Lambda containers |
| `npm run deploy:api` | Deploy the stack interactively      |

---

## 🧹 Cleanup

To delete all AWS resources created by the stack:

```bash
sam delete
```

---

## 🧱 Example Use Cases

* **Hybrid Cloud Sync:** Keep DynamoDB data mirrored in a Couchbase cluster for analytics or search.
* **Zero-Downtime Migration:** Migrate workloads from DynamoDB to Couchbase with live change streaming.
* **Cross-Service Integration:** React to DynamoDB events and update external systems in Couchbase.
* **Event Archiving:** Maintain an audit or backup store in Couchbase for long-term analysis.

---

## 🧩 Extending the Lambda

You can customize the transformation logic in:

```
src/handler/main.js
```

Inside the handler:

```js
exports.handler = async (event) => {
  for (const record of event.Records) {
    // Example: handle INSERT, MODIFY, REMOVE
    switch (record.eventName) {
      case "INSERT":
      case "MODIFY":
        await upsertToCouchbase(record.dynamodb.NewImage);
        break;
      case "REMOVE":
        await deleteFromCouchbase(record.dynamodb.Keys);
        break;
    }
  }
};
```

Modify the Couchbase SDK calls to fit your document model, scope, or collection structure.

---

## 🧾 License

Licensed under the **MIT License**.
© 2025 — Developed by **Hatim Heffoudhi**

---

## 🌐 Resources

* [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
* [AWS SDK for JavaScript (v3)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
* [Couchbase Node.js SDK](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html)
* [DynamoDB Streams Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)

---

**🧠 Tip:** This project can serve as a blueprint for integrating Couchbase with any AWS data source using streams or events — extend it for S3, Kinesis, or EventBridge in the same architecture.
