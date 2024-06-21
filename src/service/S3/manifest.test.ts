import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { SimpleFhirEntry } from '../fhir/types';
import { S3Error } from './errors';
import { generateManifest } from './manifest';
import S3ClientInstance from './S3ClientInstance';

jest.mock('./S3ClientInstance');
jest.mock('@aws-sdk/s3-request-presigner');

describe('Manifest S3 Service', () => {
    describe('Generate Manifest', () => {
        const mockSend = jest.fn();
        const keycloak_id = 'keycloak_id';
        const items: SimpleFhirEntry[] = [
            {
                id: 'drs_uri_1',
                name: 'path_to_file_1',
                s3Url: 's3://path_to_file_1',
            },
            {
                id: 'drs_uri_2',
                name: 'path_to_file_2',
                s3Url: 's3://path_to_file_2',
            },
        ];

        beforeEach(() => {
            (S3ClientInstance.getInstance as jest.Mock).mockReset();
            (getSignedUrl as jest.Mock).mockReset();
            mockSend.mockReset();
        });

        it('should generate manifest and upload it to S3 and return a presigned URL', async () => {
            mockSend.mockResolvedValue(true);
            (S3ClientInstance.getInstance as jest.Mock).mockReturnValue({
                send: mockSend,
            });
            (getSignedUrl as jest.Mock).mockResolvedValue('expected_result');

            const result = await generateManifest(keycloak_id, items);

            expect(result).toEqual('expected_result');
            expect((S3ClientInstance.getInstance as jest.Mock).mock.calls.length).toEqual(1);
            expect(mockSend.mock.calls.length).toEqual(1);
            expect((getSignedUrl as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('shoudl throw an error if S3 returns an error', async () => {
            const expectedError = new S3Error('OOPS from S3');
            mockSend.mockRejectedValue(new Error('OOPS from S3'));
            (S3ClientInstance.getInstance as jest.Mock).mockReturnValue({
                send: mockSend,
            });

            try {
                await generateManifest(keycloak_id, items);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((S3ClientInstance.getInstance as jest.Mock).mock.calls.length).toEqual(1);
                expect(mockSend.mock.calls.length).toEqual(1);
                expect((getSignedUrl as jest.Mock).mock.calls.length).toEqual(0);
            }
        });
    });
});
