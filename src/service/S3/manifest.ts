import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { manifestBucket } from '../../config/env';
import { BulkImportItem } from '../keyManager/cavatica/types';
import { S3Error } from './errors';
import S3ClientInstance from './S3ClientInstance';

const PRE_SIGNED_URL_EXPIRY_SEC = 60 * 60 * 12;

export const generateManifest = async (keycloakId: string, items: BulkImportItem[]): Promise<string> => {
    let tsvContent = `drs_uri,name\n`;

    for (const item of items) {
        const values = [item.drs_uri, item.name];
        tsvContent += `${values.join(',')}\n`;
    }

    return uploadFile(keycloakId, tsvContent);
};

const uploadFile = async (keycloakId: string, fileContent: string): Promise<string> => {
    const s3Client = S3ClientInstance.getInstance();
    const key = `VWB_${keycloakId}_${Date.now()}.csv`;

    const command = new PutObjectCommand({
        Bucket: manifestBucket,
        Key: key,
        Body: fileContent,
    });

    try {
        await s3Client.send(command);
        return getSignedUrl(s3Client, command, { expiresIn: PRE_SIGNED_URL_EXPIRY_SEC });
    } catch (err) {
        throw new S3Error(err);
    }
};
