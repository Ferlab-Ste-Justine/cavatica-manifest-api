import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { name, version } from '../../package.json';
import { fhirUrl, keycloakURL } from '../config/env';

const publicRouter = Router();

publicRouter.get('/status', async (req, res, next) => {
    try {
        res.status(StatusCodes.OK).send({
            app: name,
            version,
            keycloak_url: keycloakURL,
            fhir_url: fhirUrl,
        });
    } catch (e) {
        next(e);
    }
});

export default publicRouter;
