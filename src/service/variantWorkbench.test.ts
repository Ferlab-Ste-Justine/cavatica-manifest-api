/* eslint-disable @typescript-eslint/no-var-requires */
import { ENV_PRD, ENV_QA } from '../utils/constants';
import { NoAclError, NoOccurrenceError } from './errors';
import { FhirError, KeycloakFhirError } from './fhir/errors';
import { fetchFhirUri } from './fhir/fhirClient';
import { fetchFhirToken } from './fhir/fhirKeycloakClient';
import { FhirEntry } from './fhir/types';
import { startBulkImport } from './keyManager/cavatica/cavaticaProxyClient';
import { CavaticaError } from './keyManager/cavatica/errors';
import { BulkImportResponse } from './keyManager/cavatica/types';
import { KeyManagerError } from './keyManager/errors';
import { getUserACLs } from './keyManager/keyManagerClient';
import { S3Error } from './S3/errors';
import { generateManifest } from './S3/manifest';
import { generateManifestPreSignedUrl, loadOccurrencesToCavatica } from './variantWorkbench';

jest.mock('./keyManager/keyManagerClient');
jest.mock('./fhir/fhirKeycloakClient');
jest.mock('./fhir/fhirClient');
jest.mock('./keyManager/cavatica/cavaticaProxyClient');
jest.mock('./S3/manifest');
jest.mock('../config/env');

describe('Variant Workbench Service', () => {
    describe('Load occurrences to Cavatica', () => {
        const accessToken = 'access_token';
        const fhirAccessToken = 'fhir_access_token';
        const cavaticaProject = 'cavatica_project';
        const acls = ['acl1', 'acl2'];

        const fhirEntry1: FhirEntry = {
            resource: {
                content: [
                    {
                        attachment: {
                            url: 'drs://data.kidsfirstdrc.org/drs_url_1',
                            title: 'file1.parquet',
                        },
                    },
                    {
                        attachment: {
                            // eslint-disable-next-line max-len
                            url: 's3://occurrences_bucket/release_id=re_20240101_1/study_id=SD_0TYVY1TW/dbgap_consent_code=phs002161.c1/family_id=FM_0A0A0AAA/sample_id=BS_A0A0AAAA/file1.parquet',
                        },
                    },
                ],
            },
        } as FhirEntry;
        const fhirEntry2: FhirEntry = {
            resource: {
                content: [
                    {
                        attachment: {
                            url: 'drs://data.kidsfirstdrc.org/drs_url_2',
                            title: 'file2.parquet',
                        },
                    },
                    {
                        attachment: {
                            // eslint-disable-next-line max-len
                            url: 's3://occurrences_bucket/release_id=re_20240101_1/study_id=SD_0TYVY1TW/dbgap_consent_code=phs002161.c1/family_id=FM_0A0A0AAA/sample_id=BS_B1B1BBBB/file2.parquet',
                        },
                    },
                ],
            },
        } as FhirEntry;
        const fhirEntry3: FhirEntry = {
            resource: {
                content: [
                    {
                        attachment: {
                            url: 'drs://data.kidsfirstdrc.org/drs_url_3',
                            title: 'file3.parquet',
                        },
                    },
                    {
                        attachment: {
                            // eslint-disable-next-line max-len
                            url: 's3://occurrences_bucket/release_id=re_20240101_1/study_id=SD_0TYVY1TW/dbgap_consent_code=phs002161.c1/family_id=FM_0A0A0AAA/sample_id=BS_C3C3CCCC/file3.parquet',
                        },
                    },
                ],
            },
        } as FhirEntry;

        const bulkImportResult: BulkImportResponse = {
            href: 'https://cavatica-api.sbgenomics.com/v2/bulk/drs/imports/243039088206221312',
            id: '243039088206221312',
            result: [],
            state: 'SUBMITTED',
        };

        beforeEach(() => {
            (getUserACLs as jest.Mock).mockReset();
            (fetchFhirToken as jest.Mock).mockReset();
            (fetchFhirUri as jest.Mock).mockReset();
            (startBulkImport as jest.Mock).mockReset();

            const env = require('../config/env');
            env.mockKeyManager = false;
        });

        it('should return an error if it fails to get user ACLs', async () => {
            const getAclError = new KeyManagerError(400, 'OOPS from Key Manager');

            (getUserACLs as jest.Mock).mockRejectedValue(getAclError);

            try {
                await loadOccurrencesToCavatica(accessToken, cavaticaProject);
            } catch (e) {
                expect(e).toEqual(getAclError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(0);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(0);
                expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if the user does not have any ACL', async () => {
            const expectedError = new NoAclError();

            (getUserACLs as jest.Mock).mockResolvedValue([]);

            try {
                await loadOccurrencesToCavatica(accessToken, cavaticaProject);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(0);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(0);
                expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if it fails to get a token from FHIR keycloak', async () => {
            const errorMessage = 'OOPS from FHIR Keycloak';
            const expectedError = new KeycloakFhirError(400, errorMessage);

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockRejectedValue(expectedError);

            try {
                await loadOccurrencesToCavatica(accessToken, cavaticaProject);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(0);
                expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if it fails to get FHIR document references for ACLs', async () => {
            const errorMessage = 'OOPS from FHIR';
            const expectedError = new FhirError(400, errorMessage);

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockRejectedValue(expectedError);

            try {
                await loadOccurrencesToCavatica(accessToken, cavaticaProject);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
                expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if there is no document reference for user ACLs', async () => {
            const expectedError = new NoOccurrenceError();

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([]);

            try {
                await loadOccurrencesToCavatica(accessToken, cavaticaProject);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
                expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if it fails to post Cavatica bulk import', async () => {
            const errorMessage = 'OOPS from Cavatica Proxy';
            const expectedError = new CavaticaError(400, errorMessage);

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([fhirEntry1, fhirEntry2, fhirEntry3]);
            (startBulkImport as jest.Mock).mockRejectedValue(expectedError);

            try {
                await loadOccurrencesToCavatica(accessToken, cavaticaProject);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
                expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(1);
            }
        });

        it('should return Cavatica bulk import response if process is successful', async () => {
            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([fhirEntry1, fhirEntry2, fhirEntry3]);
            (startBulkImport as jest.Mock).mockResolvedValue(bulkImportResult);

            const result = await loadOccurrencesToCavatica(accessToken, cavaticaProject);

            expect(result).toEqual(bulkImportResult);

            expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
            expect((startBulkImport as jest.Mock).mock.calls.length).toEqual(1);
        });
    });

    describe('Load data, generate manifest and return its presigned URL', () => {
        const keycloak_id = 'keycloak_id';
        const accessToken = 'access_token';
        const fhirAccessToken = 'fhir_access_token';
        const acls = ['acl1', 'acl2'];
        const preSignedUrl = 'pre_signed_url';

        const fhirEntry1: FhirEntry = {
            resource: {
                content: [
                    {
                        attachment: {
                            url: 'drs://data.kidsfirstdrc.org/drs_url_1',
                            title: 'file1.parquet',
                        },
                    },
                    {
                        attachment: {
                            // eslint-disable-next-line max-len
                            url: 's3://occurrences_bucket/release_id=re_20240101_1/study_id=SD_0TYVY1TW/dbgap_consent_code=phs002161.c1/family_id=FM_0A0A0AAA/sample_id=BS_A0A0AAAA/file1.parquet',
                        },
                    },
                ],
            },
        } as FhirEntry;
        const fhirEntry2: FhirEntry = {
            resource: {
                content: [
                    {
                        attachment: {
                            url: 'drs://data.kidsfirstdrc.org/drs_url_2',
                            title: 'file2.parquet',
                        },
                    },
                    {
                        attachment: {
                            // eslint-disable-next-line max-len
                            url: 's3://occurrences_bucket/release_id=re_20240101_1/study_id=SD_0TYVY1TW/dbgap_consent_code=phs002161.c1/family_id=FM_0A0A0AAA/sample_id=BS_B1B1BBBB/file2.parquet',
                        },
                    },
                ],
            },
        } as FhirEntry;
        const fhirEntry3: FhirEntry = {
            resource: {
                content: [
                    {
                        attachment: {
                            url: 'drs://data.kidsfirstdrc.org/drs_url_3',
                            title: 'file3.parquet',
                        },
                    },
                    {
                        attachment: {
                            // eslint-disable-next-line max-len
                            url: 's3://occurrences_bucket/release_id=re_20240101_1/study_id=SD_0TYVY1TW/dbgap_consent_code=phs002161.c1/family_id=FM_0A0A0AAA/sample_id=BS_C3C3CCCC/file3.parquet',
                        },
                    },
                ],
            },
        } as FhirEntry;

        beforeEach(() => {
            (getUserACLs as jest.Mock).mockReset();
            (fetchFhirToken as jest.Mock).mockReset();
            (fetchFhirUri as jest.Mock).mockReset();
            (generateManifest as jest.Mock).mockReset();
        });

        it('should return an error if it fails to get user ACLs', async () => {
            const getAclError = new KeyManagerError(400, 'OOPS from Key Manager');

            (getUserACLs as jest.Mock).mockRejectedValue(getAclError);

            try {
                await generateManifestPreSignedUrl(keycloak_id, accessToken);
            } catch (e) {
                expect(e).toEqual(getAclError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(0);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(0);
                expect((generateManifest as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if the user does not have any ACL', async () => {
            const expectedError = new NoAclError();

            (getUserACLs as jest.Mock).mockResolvedValue([]);

            try {
                await generateManifestPreSignedUrl(keycloak_id, accessToken);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(0);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(0);
                expect((generateManifest as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if it fails to get a token from FHIR keycloak', async () => {
            const errorMessage = 'OOPS from FHIR Keycloak';
            const expectedError = new KeycloakFhirError(400, errorMessage);

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockRejectedValue(expectedError);

            try {
                await generateManifestPreSignedUrl(keycloak_id, accessToken);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(0);
                expect((generateManifest as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if it fails to get FHIR document references for ACLs', async () => {
            const errorMessage = 'OOPS from FHIR';
            const expectedError = new FhirError(400, errorMessage);

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockRejectedValue(expectedError);

            try {
                await generateManifestPreSignedUrl(keycloak_id, accessToken);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
                expect((generateManifest as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if there is no document reference for user ACLs', async () => {
            const expectedError = new NoOccurrenceError();

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([]);

            try {
                await generateManifestPreSignedUrl(keycloak_id, accessToken);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
                expect((generateManifest as jest.Mock).mock.calls.length).toEqual(0);
            }
        });

        it('should return an error if it fails to upload manifest on S3', async () => {
            const errorMessage = 'OOPS from S3';
            const expectedError = new S3Error(errorMessage);

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([fhirEntry1, fhirEntry2, fhirEntry3]);
            (generateManifest as jest.Mock).mockRejectedValue(expectedError);

            try {
                await generateManifestPreSignedUrl(keycloak_id, accessToken);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
                expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
                expect((generateManifest as jest.Mock).mock.calls.length).toEqual(1);
            }
        });

        it('should return S3 Presigned URL if process is successful', async () => {
            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([fhirEntry1, fhirEntry2, fhirEntry3]);
            (generateManifest as jest.Mock).mockResolvedValue(preSignedUrl);

            const result = await generateManifestPreSignedUrl(keycloak_id, accessToken);

            expect(result).toEqual(preSignedUrl);

            expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
            expect((generateManifest as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should call key manager even if mock is active when env is prd', async () => {
            const env = require('../config/env');
            env.mockKeyManager = true;
            env.env = ENV_PRD;

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([fhirEntry1, fhirEntry2, fhirEntry3]);
            (generateManifest as jest.Mock).mockResolvedValue(preSignedUrl);

            const result = await generateManifestPreSignedUrl(keycloak_id, accessToken);

            expect(result).toEqual(preSignedUrl);

            expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(2);
            expect((generateManifest as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should not call key manager if mock is active and env is qa', async () => {
            const env = require('../config/env');
            env.mockKeyManager = true;
            env.env = ENV_QA;

            (getUserACLs as jest.Mock).mockResolvedValue(acls);
            (fetchFhirToken as jest.Mock).mockResolvedValue(fhirAccessToken);
            (fetchFhirUri as jest.Mock).mockResolvedValue([fhirEntry1, fhirEntry2, fhirEntry3]);
            (generateManifest as jest.Mock).mockResolvedValue(preSignedUrl);

            const result = await generateManifestPreSignedUrl(keycloak_id, accessToken);

            expect(result).toEqual(preSignedUrl);

            expect((getUserACLs as jest.Mock).mock.calls.length).toEqual(0);
            expect((fetchFhirToken as jest.Mock).mock.calls.length).toEqual(1);
            expect((fetchFhirUri as jest.Mock).mock.calls.length).toEqual(1);
            expect((generateManifest as jest.Mock).mock.calls.length).toEqual(1);
        });
    });
});
