import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { generateManifestPreSignedUrl } from '../service/manifestWorkbench';

const manifestWorkbenchRouter = Router();

// type PostVwbBody = {
//     project: string;
// };
//
// variantWorkbenchRouter.post('/', async (req, res, next) => {
//     try {
//         const accessToken = req.headers.authorization;
//         const body: PostVwbBody = req.body;
//         const cavaticaResult = await loadOccurrencesToCavatica(accessToken, body.project);
//         res.status(StatusCodes.OK).send(cavaticaResult);
//     } catch (e) {
//         next(e);
//     }
// });

manifestWorkbenchRouter.post('/', async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        const keycloakId = req['kauth']?.grant?.access_token?.content?.sub;

        const inputIdList = req?.body?.file_ids || [];
        const presignedUrl = await generateManifestPreSignedUrl(inputIdList, accessToken, keycloakId);
        // const redirectUrl = `https://cavatica.sbgenomics.com/import-redirect/drs/csv?URL=${encodeURIComponent(presignedUrl)}`;
        // res.status(StatusCodes.OK).send({ importUrl: redirectUrl });
        res.status(StatusCodes.OK).send({ importUrl: presignedUrl }); //FIXME
    } catch (e) {
        next(e);
    }
});

export default manifestWorkbenchRouter;
