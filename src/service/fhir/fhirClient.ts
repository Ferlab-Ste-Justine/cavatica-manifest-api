import { fhirUrl } from '../../config/env';
import { FhirError } from './errors';
import { FhirEntry, FhirLink, FhirOutput } from './types';

export const fetchFhirUri = async (uri: string, accessToken: string, result: FhirEntry[]): Promise<FhirEntry[]> => {
    const response = await fetch(encodeURI(uri), {
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 200) {
        const body: FhirOutput = await response.json();
        const nextLink: FhirLink | undefined = body.link.find((l) => l.relation === 'next');

        const newResult = result.concat(body.entry);
        if (!nextLink) {
            return newResult;
        } else {
            return fetchFhirUri(nextLink.url, accessToken, newResult);
        }
    }

    throw new FhirError(response.status, await response.text());
};

export const getDocumentSearchUri = (acl: string): string =>
    `${fhirUrl}/DocumentReference?security-label:text=${acl}&format:text=parquet`;
