import { Application } from 'express';
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import audit from '../routes/audit';
import { version } from '../../package.json';
import moment from 'moment';

export function InitRoutes(app: Application) {
    app.use('/api/v1/audit', audit);
    app.get('/', (_reg, res) => res.send(moment().format('dddd, MMMM Do YYYY, HH:mm:ss Z')));
}

export function InitSwaggerDoc(app: Application, serverUrl: string) {
    const options: swaggerjsdoc.Options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Audit Service',
                description: 'Audit service to collect information from other applications and services.',
                termsOfService: 'https://en.wikipedia.org/wiki/Unlicense',
                license: {
                    name: 'Software License',
                    url: 'https://en.wikipedia.org/wiki/Unlicense',
                },
                version,
            },
            servers: [
                {
                    url: serverUrl,
                },
            ],
        },
        apis: ['./src/routes/*.ts', './src/dtos/*.ts'],
        info: {
            title: 'Audit Service',
            version,
        },
    };

    const swaggerSpec = swaggerjsdoc(options);
    app.use('/api-docs', swaggerui.serve, swaggerui.setup(swaggerSpec));
}
