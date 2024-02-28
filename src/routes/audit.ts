import express, { Request, Response } from 'express';
import AppLogger from '../utils/Logger';
import { Audit, validateAudit } from '../models/audit';
import AuditDto, { AuditGetAllDto } from '../dtos/AuditDto';
import hasApiKey from '../middleware/apiKey';
import parseBool from '../utils/parseBool';
import { AppEnv, Env } from '../utils/AppEnv';
import { InvariantTimeStamp } from '../utils/InvariantTimeStamp';
import { RouteErrorFormatter, RouteHandlingError } from '../utils/RouteHandlingError';

const router = express.Router();
const logger = new AppLogger(module);

/**
 * @swagger
 * /api/audit:
 *   post:
 *     tags:
 *       - audit
 *     summary: Create an audit record
 *     description: Creates an audit record to preserve an event.
 *     operationId: createAudit
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         description: API key to authorize access
 *         schema:
 *           type: string
 *       - in: query
 *         name: returnNew
 *         required: false
 *         description: Optionally Boolean value to return the created audit document
 *         schema:
 *           type: boolean
 *     requestBody:
 *       description: Audit information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Audit'
 *     responses:
 *       '200':
 *         description: Created audit document if returnNew query parameter was set to True
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuditResponse'
 */

router.post('/', hasApiKey, async (req: Request, res: Response) => {
    try {
        logger.debug('Inside POST, creating new audit record...');
        const receivedAudit = { ...req.body } as AuditDto;

        const { error } = validateAudit(receivedAudit);

        if (error) {
            throw new RouteHandlingError(400, error.message);
        }

        logger.info(JSON.stringify(receivedAudit, null, 2));

        const mongoLogEnabled = parseBool(AppEnv.Get(Env.MONGOLOG_ENABLED));

        if (mongoLogEnabled === true) {
            let audit = new Audit({
                timeStamp: new Date(receivedAudit.timeStamp), //"2023-04-20T00:00:00.000Z"
                userId: receivedAudit.userId,
                source: receivedAudit.source,
                method: receivedAudit.method,
                data: receivedAudit.data,
            });

            audit = (await audit.save()) as AuditDto;

            logger.info('Audit record created. ID: ' + audit._id);
            logger.debug(JSON.stringify(audit));

            // Only return the new audit object if this was requested
            if (req.query.returnNew !== undefined && parseBool(req.query.returnNew as string) === true) {
                return res.status(200).json(audit);
            } else {
                return res.status(200).send('Success');
            }
        } else {
            return res.status(200).send('Success');
        }
    } catch (ex) {
        const error = RouteErrorFormatter(ex, __filename, 'Fatal error Audit POST');
        logger.error(error.message);
        return res.status(error.httpStatus).send(error.message);
    }
});

/**
 * @swagger
 * /api/audit:
 *   get:
 *     tags:
 *       - audit
 *     summary: Retreive audit record, optionally sort and filter the results set.
 *     description: The audit data set can be filtered, sorted to retreive only the audit log entities that are of interest and only those fields that are needed. In case only a subset of fields are requested to be returned, this should be specified in the request BODY in form of a JSON object {"select"&#58; ["_id", "timeStamp", "data"]}
 *     operationId: getAudit
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         description: Secret to authorize access to this endpoint
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageSize
 *         required: false
 *         description: Page size of the data to retrieve. Default value is 10. Example '10'
 *         schema:
 *           type: number
 *       - in: query
 *         name: pageNumber
 *         required: false
 *         description: Page number of the data to retrieve. Default value is 1. Example '1'
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         required: false
 *         description: Field name that the returned information should be sorted by. Example 'timeStamp'
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: Timestampt for the start of audit log event retrieval in ISO 8601 format. Example '2023-04-20T00:00:00.000Z'
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: Timestampt for the end of audit log event retrieval in ISO 8601 format. Example '2023-04-21T23:59:59.000Z'
 *         schema:
 *           type: string
 *
 *     responses:
 *       '200':
 *         description: JSON object containing standard paging information that allows the UI to easier determine if there are more information and what link to use to get the next or previous page.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuditGetResponse'
 */

router.get('/', hasApiKey, async (req: Request, res: Response) => {
    const pageNumber: number = req.query.pageNumber ? +req.query.pageNumber : 1;
    const pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;
    const sortBy = { timeStamp: 1 };

    try {
        const filter = buildFilter(req.query.startDate as string, req.query.endDate as string);
        const getFields = selectFields(req.body.select);

        /*
        {
            timeStamp: {
                $gte: new Date(new Date('2023-04-20').setUTCHours(8, 0, 0)),
                $lte: new Date(new Date('2023-04-20').setUTCHours(8, 0, 0)),
            },
        }
        */
        const events = (await Audit.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort(sortBy)
            .select(getFields)) as AuditDto[];

        const response = buildResponse(req, pageNumber, pageSize, events);
        logger.debug('Returning: ' + JSON.stringify(response));
        logger.info('Success');
        return res.status(200).json(response);
    } catch (ex) {
        const error = RouteErrorFormatter(ex, __filename, 'Fatal error Audit GET');
        logger.error(error.message);
        return res.status(error.httpStatus).send(error.message);
    }
});

/**
 * Buils the database query filter so that documents in a date range are returned
 * @param startDate - Optional start date in ISO format. Example: "2023-04-20T00:00:00.000Z" or "2023-04-20T00:00:00"
 * @param endDate - Optional end date in ISO format. Example: "2023-04-20T00:00:00.000Z" or "2023-04-20T00:00:00"
 * @returns filter object to be used with .find()
 */

function buildFilter(startDate: string, endDate: string) {
    let filter = {};

    try {
        if (startDate !== undefined) {
            // "2023-04-20T00:00:00.000Z"

            const startDt = new InvariantTimeStamp(startDate);
            const endDt = new InvariantTimeStamp(endDate === undefined ? '2050-12-31T23:59:59' : endDate);

            // Very important to note that the field to filter on is 'timeStamp' and not 'createdAt'.
            // The date and time when the even was created might not be the same as when the database
            // entry was created. As an example with delayed event notification in an occasionally
            // connected environment.

            filter = {
                timeStamp: {
                    $gte: new Date(new Date(startDt.getDatePortion()).setUTCHours(startDt.hours, startDt.minutes, startDt.seconds)),
                    $lte: new Date(new Date(endDt.getDatePortion()).setUTCHours(endDt.hours, endDt.minutes, endDt.seconds)),
                },
            };
        }
    } catch (ex) {
        if (ex instanceof Error) {
            throw new RouteHandlingError(400, ex.message);
        } else {
            throw ex;
        }
    }

    return filter;
}

/**
 * This function builds the return object that is returned from the GET call where
 * several products are returned. Paging help is provided.
 * @param req - HTTP Request object
 * @param pageNumber - Current page number that was requested
 * @param pageSize - Page size that was requested
 * @param products - Array of products that are returned
 * @returns {AuditGetAllDto} - JSON object of type AuditGetAllDto
 */
function buildResponse(req: Request, pageNumber: number, pageSize: number, products: AuditDto[]): AuditGetAllDto {
    let fullUrl: string = req.protocol + '://' + req.get('host') + req.originalUrl;

    const idx = fullUrl.lastIndexOf('?');

    if (idx !== -1) {
        fullUrl = fullUrl.substring(0, idx);
    }

    let response: AuditGetAllDto = {
        pageSize: pageSize,
        pageNumber: pageNumber,
        _links: {
            base: fullUrl,
        },
        results: products,
    };

    if (pageNumber > 1) {
        response._links.prev = fullUrl + `?pageSize=${pageSize}&pageNumber=${pageNumber - 1}`;
    }

    if (products.length === pageSize) {
        response._links.next = fullUrl + `?pageSize=${pageSize}&pageNumber=${pageNumber + 1}`;
    }

    return response;
}

/**
 *
 * @param fieldRequested Return a JSON object that specified to the database
 * the list of fields that the user is requesting.
 * @returns JSON object listing requested fields.
 */
function selectFields(fieldRequested: string[]) {
    var obj: any = {};

    if (fieldRequested !== undefined) {
        fieldRequested.forEach((field) => {
            obj[field] = 1;
        });
    }

    return obj;
}

export default router;
