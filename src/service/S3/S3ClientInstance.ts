import { S3Client } from '@aws-sdk/client-s3';

class S3ClientInstance {
    private instance: S3Client;
    constructor() {
        if (!this.instance) {
            this.instance = new S3Client({
                endpoint: process.env.AWS_ENDPOINT,
                region: 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
        }
    }

    getInstance() {
        return this.instance;
    }
}

const singletonS3ClientInstance = new S3ClientInstance();

Object.freeze(singletonS3ClientInstance);

export default singletonS3ClientInstance;
