import { NoOccurrenceError } from './errors';
import { fetchUserPermittedFiles } from './ferload/ferloadClient';
import { fetchFhirUri, getDocumentsByIdUri, getRelatedDocumentsUri } from './fhir/fhirClient';
import { fetchFhirAccessToken, fetchFhirRPTToken } from './fhir/fhirKeycloakClient';
import { SimpleFhirEntry } from './fhir/types';
import { generateManifest } from './S3/manifest';

export const generateManifestPreSignedUrl = async (
    inputIdList: string[],
    accessToken: string,
    keycloakId: string,
): Promise<string> => {
    const fhirAccessToken = await fetchFhirAccessToken();
    const fhirRPTToken = await fetchFhirRPTToken(fhirAccessToken);

    //Two queries, there is no good/simple way to fetch the request and their index docs at the same time
    const indexFhirDocs = await fetchFhirUri(getRelatedDocumentsUri(inputIdList), fhirRPTToken, []);
    const requestedFhirDocs = await fetchFhirUri(getDocumentsByIdUri(inputIdList), fhirRPTToken, []);

    //Assume there is only one item in the content (this is true for CQDG)
    const docsWithIndex: SimpleFhirEntry[] = [...requestedFhirDocs, ...indexFhirDocs].map((entry) => ({
        id: entry.resource.id,
        name: entry.resource.content[0].attachment.title,
        s3Url: entry.resource.content[0].attachment.url,
    }));

    const permittedIdList = await fetchUserPermittedFiles(
        accessToken,
        docsWithIndex.map((entry) => entry.id),
    );

    const allPermittedDocs = docsWithIndex.filter((entry) => permittedIdList.includes(entry.id));

    if (allPermittedDocs.length === 0) throw new NoOccurrenceError();

    return await generateManifest(keycloakId, allPermittedDocs);
};
