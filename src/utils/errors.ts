import { NextFunction, Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import { NoAclError, NoOccurrenceError } from '../service/errors';

export const globalErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof NoAclError || err instanceof NoOccurrenceError) {
        res.status(StatusCodes.BAD_REQUEST).json({
            error: err.message,
        });
    } else if (err instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        });
    } else {
        throw err;
    }
};

export const globalErrorLogger = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
    // eslint-disable-next-line no-console
    console.log(err);
    next(err);
};
