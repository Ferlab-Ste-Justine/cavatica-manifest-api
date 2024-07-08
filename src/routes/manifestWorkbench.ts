import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { generateManifestPreSignedUrl } from '../service/manifestWorkbench';

const manifestWorkbenchRouter = Router();

manifestWorkbenchRouter.post('/', async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        const keycloakId = req['kauth']?.grant?.access_token?.content?.sub;

        const inputIdList = req?.body?.file_ids || [];
        const presignedUrl = await generateManifestPreSignedUrl(inputIdList, accessToken, keycloakId);
        const redirectUrl = `https://cavatica.sbgenomics.com/import-redirect/drs/csv?URL=${encodeURIComponent(presignedUrl)}`;
        res.status(StatusCodes.OK).send({ importUrl: redirectUrl });
    } catch (e) {
        next(e);
    }
});

export default manifestWorkbenchRouter;
