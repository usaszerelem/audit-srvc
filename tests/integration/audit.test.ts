import express, { Express } from 'express';
import { Server } from 'http';
import request from 'supertest';
import { ServerInit } from '../../src/startup/serverInit';
import { Audit } from '../../src/models/audit';
import AuditDto, { AuditGetAllDto } from '../../src/dtos/AuditDto';
import mongoose from 'mongoose';
import { createAuditLogs } from '../../src/utils/createAuditLogs';
//import AppLogger from '../../src/utils/Logger';
//const logger = new AppLogger(module);

const app: Express = express();

describe('/api/audit', () => {
    const apiKey = '1234abcd';
    let server: Server | null;

    var _beforeall = async function () {
        await ServerInit(app);
        server = app.listen(3001, async () => {});
    };

    var _afterall = async function () {
        await Audit.deleteMany({})
            .then(async function () {
                await mongoose.connection.close();
            })
            .catch(function (_error: any) {
                //console.log(error);
            });

        if (server !== null) {
            server.close();
        }
    };

    var _beforeEach = async function () {};

    var _afterEach = async function () {
        await Audit.deleteMany({});
    };

    describe('Products CRUD Validation', () => {
        beforeAll(_beforeall);
        afterAll(_afterall);
        beforeEach(_beforeEach);
        afterEach(_afterEach);

        it('should create new audit log entry', async () => {
            const auditLogInfo: AuditDto = {
                timeStamp: new Date('2023-04-20T08:00:00.000Z'),
                userId: '1231231231231231231231',
                source: 'Postman',
                method: 'GET',
                data: 'Test data',
            };

            const res = await request(server)
                .post('/api/audit')
                .set('x-api-key', apiKey)
                .send(auditLogInfo);

            expect(res.status).toBe(200);

            let returned: AuditDto = { ...res.body };
            expect(returned).toHaveProperty('_id');
            expect(returned).toHaveProperty('timeStamp');
            expect(returned).toHaveProperty('userId');
            expect(returned).toHaveProperty('source');
            expect(returned).toHaveProperty('method');
            expect(returned).toHaveProperty('data');

            expect(returned.userId).toBe('1231231231231231231231');
            expect(returned.source).toBe('Postman');
            expect(returned.method).toBe('GET');
            expect(returned.data).toBe('Test data');
        });

        it('should get fields by start/end timestamp', async () => {
            await createAuditLogs();

            const returnFields = {
                select: ['_id', 'timeStamp', 'data'],
            };

            const res = await request(server)
                .get('/api/audit')
                .set('x-api-key', apiKey)
                .set('startDate', '2023-04-20T08:00:00.000Z')
                .set('endDate', '2023-04-20T12:00:00.000Z')
                .send(returnFields);

            expect(res.status).toBe(200);

            const response = res.body as AuditGetAllDto;

            expect(response.results.length).toBe(4);
            expect(response.results[0]).toHaveProperty('_id');
            expect(response.results[0]).toHaveProperty('data');
            expect(response.results[0]).not.toHaveProperty('timeStamp');
            expect(response.results[0]).not.toHaveProperty('userId');
            expect(response.results[0]).not.toHaveProperty('source');
            expect(response.results[0]).not.toHaveProperty('method');
        });
    });
});
