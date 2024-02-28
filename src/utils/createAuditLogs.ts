import AuditDto from '../dtos/AuditDto';
import { Audit } from '../models/audit';
import AppLogger from './Logger';
import { RouteErrorFormatter } from './RouteHandlingError';
const logger = new AppLogger(module);

export async function createAuditLogs(): Promise<void> {
    const auditLogInfo: AuditDto[] = [
        {
            timeStamp: new Date('2023-04-20T08:00:00.000Z'),
            userId: '1231231231231231231231',
            source: 'Postman',
            method: 'GET',
            data: 'Retreived chocolate chip cookie recepie',
        },
        {
            timeStamp: new Date('2023-04-20T09:00:00.000Z'),
            userId: '1111111111111111111111',
            source: 'Application',
            method: 'POST',
            data: 'Added chocolate chip cookie recepie',
        },
        {
            timeStamp: new Date('2023-04-20T10:00:00.000Z'),
            userId: '2222222222222222222222',
            source: 'Application',
            method: 'POST',
            data: 'Added snickerdoodle cookie recepie',
        },
        {
            timeStamp: new Date('2023-04-20T11:00:00.000Z'),
            userId: '3333333333333333333333',
            source: 'Application',
            method: 'GET',
            data: 'Retreived all cookie recipies',
        },
    ];

    try {
        logger.info('Database initialized. Creating audit logs');
        await Audit.deleteMany({});

        for (let idx = 0; idx < auditLogInfo.length; idx++) {
            let audit = new Audit(auditLogInfo[idx]);
            audit = await audit.save();
            logger.info('Audit log created: ' + JSON.stringify(audit, null, 2));
        }
    } catch (ex) {
        const error = RouteErrorFormatter(ex, __filename, 'Create Audit Logs Error');
        logger.error(error.message);
    }
}
