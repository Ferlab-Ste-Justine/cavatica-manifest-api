import { Express } from 'express';
import Keycloak from 'keycloak-connect';
import request from 'supertest';

import { fakeKeycloakConfig } from '../../test/authTestUtils';
import buildApp from '../app';

describe('Public router', () => {
    let app: Express;

    beforeEach(() => {
        const keycloak = new Keycloak({}, fakeKeycloakConfig);
        app = buildApp(keycloak); // Re-create app between each test to ensure isolation between tests.
    });

    describe('GET /status', () => {
        it('should return 200', async () => request(app).get('/status').expect(200));
    });
});
