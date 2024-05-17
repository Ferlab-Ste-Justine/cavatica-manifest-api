import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { generateManifestPreSignedUrl, loadOccurrencesToCavatica } from '../service/variantWorkbench';

const variantWorkbenchRouter = Router();

type PostVwbBody = {
    project: string;
};

variantWorkbenchRouter.post('/', async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        const body: PostVwbBody = req.body;
        const cavaticaResult = await loadOccurrencesToCavatica(accessToken, body.project);
        res.status(StatusCodes.OK).send(cavaticaResult);
    } catch (e) {
        next(e);
    }
});

variantWorkbenchRouter.get('/manifest', async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        const keycloakId = req['kauth']?.grant?.access_token?.content?.sub;
        const presignedUrl = await generateManifestPreSignedUrl(keycloakId, accessToken);
        const redirectUrl = `https://cavatica.sbgenomics.com/import-redirect/drs/csv?URL=${encodeURIComponent(presignedUrl)}`;
        res.redirect(StatusCodes.MOVED_TEMPORARILY, redirectUrl);
    } catch (e) {
        next(e);
    }
});

export default variantWorkbenchRouter;
