import cors from 'cors';
import express, { Express } from 'express';
import { sanitize, xss } from 'express-xss-sanitizer';
import { Keycloak } from 'keycloak-connect';

import publicRouter from './routes/public';
import variantWorkbench from './routes/variantWorkbench';
import { globalErrorHandler, globalErrorLogger } from './utils/errors';

const buildApp = (keycloak: Keycloak): Express => {
    const app = express();

    app.use((req, _res, next) => {
        req.body = sanitize(req.body);
        next();
    });

    app.use(cors());
    app.use(xss());
    app.use(express.json({ limit: '50mb' }));

    app.use(
        keycloak.middleware({
            logout: '/logout',
            admin: '/',
        }),
    );

    app.use('/manifest', keycloak.protect(), variantWorkbench);
    app.use('/', publicRouter);

    app.use(globalErrorLogger, globalErrorHandler);

    return app;
};

export default buildApp;
