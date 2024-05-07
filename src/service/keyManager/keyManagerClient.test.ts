/* eslint-disable @typescript-eslint/no-var-requires */
import { KeyManagerError } from './errors';
import { getUserACLs } from './keyManagerClient';

jest.mock('../../config/env');

describe('Key Manager Client', () => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve([]),
        } as Response),
    );

    const accessToken = 'Bearer bearer';

    describe('Get user ACLs', () => {
        beforeEach(() => {
            (global.fetch as unknown as jest.Mock).mockReset();
        });

        it('should return an empty list if no fence is configured', async () => {
            const env = require('../../config/env');
            env.fenceList = [];
            const mockResponse = {
                status: 200,
                json: () => {},
            };
            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const result = await getUserACLs(accessToken);

            expect(result).toEqual([]);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(0);
        });

        it('should return all acls (fetch by fence in config)', async () => {
            const env = require('../../config/env');
            env.fenceList = ['gen3', 'dcf'];
            const mockResponse = {
                status: 200,
                json: () => ({
                    acl: ['acl1', 'acl2'],
                }),
            };
            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const result = await getUserACLs(accessToken);

            expect(result).toEqual(['acl1', 'acl2']);
            expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(2);
        });

        it('should throw a KeyManagerError if an error occurs', async () => {
            const errorMessage = 'OOPS from Key Manager';
            const mockResponse = { status: 400, text: () => errorMessage };

            const env = require('../../config/env');
            env.fenceList = ['gen3'];
            (global.fetch as unknown as jest.Mock).mockImplementation(() => mockResponse);

            const expectedError = new KeyManagerError(400, errorMessage);

            try {
                await getUserACLs(accessToken);
            } catch (e) {
                expect(e).toEqual(expectedError);
            } finally {
                expect((global.fetch as unknown as jest.Mock).mock.calls.length).toEqual(1);
            }
        });
    });
});
