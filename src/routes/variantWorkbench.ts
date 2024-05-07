import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { loadOccurrencesToCavatica } from '../service/variantWorkbench';

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

export default variantWorkbenchRouter;
