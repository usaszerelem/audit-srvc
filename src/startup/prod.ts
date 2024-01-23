import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

export function GlobalServiceConfig(app: Express) {
    // Helps Node services by setting several HTTP headers. It acts as a middleware
    // for Express, automatically adds or removes HTTP headers to comply with web
    // security standards.
    app.use(helmet());

    // The middleware will attempt to compress response bodies for all request
    // that traverse through the middleware
    app.use(compression());

    // parses incoming requests with JSON payloads and is based on body-parser.
    // Both are needed for POST and PUT requests, because in both these requests
    // you are sending data (in the form of some data object) to the server and
    // you are asking the server to accept or store that data (object), which is
    // enclosed in the body (i.e. req.body) of that (POST or PUT) Request
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
}
