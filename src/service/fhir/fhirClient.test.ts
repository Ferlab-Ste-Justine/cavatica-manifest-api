import { FhirError } from './errors';
import { fetchFhirUri } from './fhirClient';
import { FhirEntry, FhirOutput } from './types';

describe('FHIR Client', () => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve([]),
        } as Response),
    );

    const accessToken = 'Bearer bearer';
    const fhirUri = 'fetchUri';

    const fhirEntry1: FhirEntry = {} as FhirEntry;
    const fhirEntry2: FhirEntry = {} as FhirEntry;
    const fhirEntry3: FhirEntry = {} as FhirEntry;

    const fhirFirstOutput: FhirOutput = {
        link: [{ relation: 'next', url: 'fetchNextUri' }],
        entry: [fhirEntry1, fhirEntry2],
        total: 3,
        meta: { lastUpdated: '' },
        resourceType: '',
        id: '',
        type: '',
    };
    const fhirNextOutput: FhirOutput = {
        link: [],
        entry: [fhirEntry3],
        total: 3,
        meta: { lastUpdated: '' },
        resourceType: '',
        id: '',
        type: '',
    };

    describe('Fetch data from FHIR', () => {
        beforeEach(() => {
            (global.fetch as unknown as jest.Mock).mockReset();
        });

        it('should call fetchFhirUri recursively until next link is not null', async () => {
            const mockFirstResponse = {
                status: 200,
                json: () => fhirFirstOutput,
            };
            const mockNextResponse = {
                status: 200,
                json: () => fhirNextOutput,
            };
            (global.fetch as unknown as jest.Mock).mockImplementation((uri) => {
                if (uri === fhirUri) {
                    return mockFirstResponse;
                } else {
                    return mockNextResponse;
                }
            });

            const result = await fetchFhirUri(fhirUri, accessToken, []);
            const expectedResult = [fhirEntry1, fhirEntry2, fhirEntry3];

            expect(result).toEqual(expectedResult);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(2);
        });

        it('should throw a FhirError if an error occurs', async () => {
            const errorMessage = 'OOPS from Fhir';
            const mockResponse = { status: 400, text: () => errorMessage };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const expectedError = new FhirError(400, errorMessage);

            try {
                await fetchFhirUri(fhirUri, accessToken, []);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
            }
        });
    });
});
