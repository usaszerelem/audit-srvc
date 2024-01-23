import AppLogger from '../utils/Logger';
import { Request, Response, NextFunction } from 'express';
import _ from 'underscore';
import { AppEnv, Env } from '../utils/AppEnv';

const logger = new AppLogger(module);

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

export default function hasApiKey(req: Request, res: Response, next: NextFunction) {
    if (_.isUndefined(req) === false && _.isUndefined(req.header) === false) {
        logger.info('Validation Audit API Key...');

        const token = req.header('x-api-key');

        if (!token || token !== AppEnv.Get(Env.AUDIT_API_KEY)) {
            const msg = 'Access denied. No API Key provided.';
            logger.error(msg);
            return res.status(401).send(msg);
        }
    }

    next();
}
