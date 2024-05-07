import { Express } from 'express';
import Keycloak from 'keycloak-connect';
import request from 'supertest';

import { fakeKeycloakConfig, getToken } from '../../test/authTestUtils';
import buildApp from '../app';
import { BulkImportResponse } from '../service/keyManager/cavatica/types';
import { KeyManagerError } from '../service/keyManager/errors';
import { loadOccurrencesToCavatica } from '../service/variantWorkbench';

jest.mock('../service/variantWorkbench');

const checkBody = (expectedBody) => (res) => {
    expect(JSON.stringify(res.body)).toEqual(JSON.stringify(expectedBody));
};

describe('Express app', () => {
    let app: Express;

    beforeEach(() => {
        const keycloak = new Keycloak({}, fakeKeycloakConfig);
        app = buildApp(keycloak); // Re-create app between each test to ensure isolation between tests.
    });

    describe('POST /vwb', () => {
        const body = {
            project: 'my-cavatica-project',
        };

        beforeEach(() => {
            (loadOccurrencesToCavatica as jest.Mock).mockReset();
        });

        it('should return 403 if no Authorization header', async () =>
            request(app).post('/vwb').send(body).set('Content-type', 'application/json').expect(403));

        it('should return 403 if Authorization header contain expired token', async () => {
            const token = getToken(-1000);
            await request(app)
                .post('/vwb')
                .send(body)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(403);
        });

        it('should return 500 if Authorization header is valid but an error occurs', async () => {
            const expectedError = new KeyManagerError(500, 'OOPS');
            (loadOccurrencesToCavatica as jest.Mock).mockImplementation(() => {
                throw expectedError;
            });

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .post('/vwb')
                .send(body)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(500, { error: 'Internal Server Error' });
            expect((loadOccurrencesToCavatica as jest.Mock).mock.calls.length).toEqual(1);
            expect((loadOccurrencesToCavatica as jest.Mock).mock.calls[0][0]).toEqual(`Bearer ${token}`);
            expect((loadOccurrencesToCavatica as jest.Mock).mock.calls[0][1]).toEqual(body.project);
        });

        it('should return 200 with the user returned by service if Authorization header is valid', async () => {
            const bulkImportResult: BulkImportResponse = {
                href: 'https://cavatica-api.sbgenomics.com/v2/bulk/drs/imports/243039088206221312',
                id: '243039088206221312',
                result: [],
                state: 'SUBMITTED',
            };

            (loadOccurrencesToCavatica as jest.Mock).mockImplementation(() => bulkImportResult);

            const token = getToken(1000, 'keycloak_id');
            await request(app)
                .post('/vwb')
                .send(body)
                .set('Content-type', 'application/json')
                .set({ Authorization: `Bearer ${token}` })
                .expect(checkBody(bulkImportResult))
                .expect(200);

            expect((loadOccurrencesToCavatica as jest.Mock).mock.calls.length).toEqual(1);
            expect((loadOccurrencesToCavatica as jest.Mock).mock.calls[0][0]).toEqual(`Bearer ${token}`);
            expect((loadOccurrencesToCavatica as jest.Mock).mock.calls[0][1]).toEqual(body.project);
        });
    });
});
