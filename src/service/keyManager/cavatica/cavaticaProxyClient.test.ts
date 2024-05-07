import { startBulkImport } from './cavaticaProxyClient';
import { CavaticaError } from './errors';
import { BulkImportItem, BulkImportResponse } from './types';

describe('Cavatica Proxy (Key Manager) Client', () => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve([]),
        } as Response),
    );

    const accessToken = 'Bearer bearer';

    const items: BulkImportItem[] = [
        {
            drs_uri: 'drs_uri_1',
        },
        {
            drs_uri: 'drs_uri_2',
        },
    ];

    describe('Start Bulk Import', () => {
        beforeEach(() => {
            (global.fetch as unknown as jest.Mock).mockReset();
        });

        it('should return response from cavatica proxy if 200', async () => {
            const bulkImportResult: BulkImportResponse = {
                href: 'https://cavatica-api.sbgenomics.com/v2/bulk/drs/imports/243039088206221312',
                id: '243039088206221312',
                result: [],
                state: 'SUBMITTED',
            };
            const mockResponse = {
                status: 200,
                json: () => bulkImportResult,
            };
            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const result = await startBulkImport(accessToken, items);

            expect(result).toEqual(bulkImportResult);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should throw a CavaticaError if an error occurs', async () => {
            const errorMessage = 'OOPS from Cavatica Proxy';
            const mockResponse = { status: 400, text: () => errorMessage };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const expectedError = new CavaticaError(400, errorMessage);

            try {
                await startBulkImport(accessToken, items);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
            }
        });
    });
});
