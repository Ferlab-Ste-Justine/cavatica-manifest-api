import { KeycloakFhirError } from './errors';
import { fetchFhirAccessToken, fetchFhirRPTToken } from './fhirKeycloakClient';

describe('FHIR Keycloak Client', () => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve([]),
        } as Response),
    );

    describe('Fetch a FHIR token', () => {
        beforeEach(() => {
            (global.fetch as unknown as jest.Mock).mockReset();
        });

        it('should return the access token returned by FHIR keycloak', async () => {
            const expectedResult = 'fhir_access_token';
            const mockResponse = {
                status: 200,
                json: () => ({
                    access_token: expectedResult,
                }),
            };
            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const result = await fetchFhirAccessToken();

            expect(result).toEqual(expectedResult);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should return the rpt token returned by FHIR keycloak', async () => {
            const expectedResult = 'fhir_rpt_token';
            const mockResponse = {
                status: 200,
                json: () => ({
                    access_token: expectedResult,
                }),
            };
            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const result = await fetchFhirRPTToken('fhir_access_token');

            expect(result).toEqual(expectedResult);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
        });

        it('should throw a KeycloakFhirError if an error occurs', async () => {
            const errorMessage = 'OOPS from FHIR Keycloak';
            const mockResponse = { status: 400, text: () => errorMessage };

            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const expectedError = new KeycloakFhirError(400, errorMessage);

            try {
                await fetchFhirAccessToken();
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
            }
        });
    });
});
