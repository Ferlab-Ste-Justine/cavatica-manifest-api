import { env, mockKeyManager } from '../config/env';
import { ENV_QA } from '../utils/constants';
import { NoAclError, NoOccurrenceError } from './errors';
import { fetchFhirUri, getDocumentSearchUri } from './fhir/fhirClient';
import { fetchFhirToken } from './fhir/fhirKeycloakClient';
import { FhirEntry, FhirEntryContent } from './fhir/types';
import { startBulkImport } from './keyManager/cavatica/cavaticaProxyClient';
import { BulkImportItem, BulkImportResponse } from './keyManager/cavatica/types';
import { getUserACLs } from './keyManager/keyManagerClient';
import { generateManifest } from './S3/manifest';

export const loadOccurrencesToCavatica = async (accessToken: string, project: string): Promise<BulkImportResponse> => {
    const acls = await getUserACLs(accessToken);

    if (acls.length === 0) throw new NoAclError();

    const parquets: FhirEntry[] = await getDocumentReferenceForACLs(acls);

    if (parquets.length === 0) throw new NoOccurrenceError();

    const items: BulkImportItem[] = parquets.map((p) =>
        mapFhirEntryContentsToCavaticaBulkImportItem(p.resource.content, project),
    );

    const cavaticaBulkImportResult = await startBulkImport(accessToken, items);
    return cavaticaBulkImportResult;
};

export const generateManifestPreSignedUrl = async (keycloakId: string, accessToken: string): Promise<string> => {
    let acls = [];
    if (mockKeyManager && env === ENV_QA) {
        acls = ['phs002161.c1'];
    } else {
        acls = await getUserACLs(accessToken);
    }

    if (acls.length === 0) throw new NoAclError();

    const parquets: FhirEntry[] = await getDocumentReferenceForACLs(acls);

    if (parquets.length === 0) throw new NoOccurrenceError();

    const items: BulkImportItem[] = parquets.map((p) =>
        mapFhirEntryContentsToCavaticaBulkImportItem(p.resource.content, ''),
    );

    const preSignedUrl = await generateManifest(keycloakId, items);

    return preSignedUrl;
};

const getDocumentReferenceForACLs = async (acls: string[]): Promise<FhirEntry[]> => {
    const accessToken = await fetchFhirToken();

    const documents = await Promise.all(acls.map((acl) => getDocumentReferenceForACL(acl, accessToken)));
    return documents.flat(1);
};

const getDocumentReferenceForACL = async (acl: string, accessToken: string): Promise<FhirEntry[]> => {
    const fhirDocuments = await fetchFhirUri(getDocumentSearchUri(acl), accessToken, []);

    const documents = fhirDocuments.filter((r) => r != undefined);
    return documents;
};

const mapFhirEntryContentsToCavaticaBulkImportItem = (
    entryContents: FhirEntryContent[],
    project: string,
): BulkImportItem => {
    const drsContent = entryContents.find((e) => e.attachment.url.startsWith('drs://'));
    const s3Content = entryContents.find((e) => e.attachment.url.startsWith('s3://'));
    const s3Url = s3Content.attachment.url;
    const bucketName = getBucketFromS3Url(s3Url);
    const fullPath = s3Url.substring(bucketName.length, s3Url.length);

    return {
        drs_uri: drsContent.attachment.url,
        name: fullPath,
        project,
        metadata: {
            s3_url: s3Url,
        },
    };
};

const getBucketFromS3Url = (s3Url: string): string => {
    const end = s3Url.split('/', 3).join('/').length;
    return s3Url.substring(0, end);
};
