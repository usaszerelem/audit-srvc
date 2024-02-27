import path from 'path';

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

export enum Env {
    SERVICE_NAME = 'SERVICE_NAME',
    USE_HTTPS = 'USE_HTTPS',
    AUDIT_PORT = 'PORT',
    MONGODB_URL = 'MONGODB_URL',
    AUDIT_API_KEY = 'AUDIT_API_KEY',
    LOG_LEVEL = 'LOG_LEVEL',
    CONSOLELOG_ENABLED = 'CONSOLELOG_ENABLED',
    FILELOG_ENABLED = 'FILELOG_ENABLED',
    MONGOLOG_ENABLED = 'MONGOLOG_ENABLED',
}

export class AppEnv {
    private static instance: AppEnv;
    private static allSettings: [Env, string][] = [];
    private missingEnvVars: string[] = [];

    private constructor() {
        this.GetEnvVar(process.env.SERVICE_NAME, Env.SERVICE_NAME);
        this.GetEnvVar(process.env.USE_HTTPS, Env.USE_HTTPS);
        this.GetEnvVar(process.env.AUDIT_PORT, Env.AUDIT_PORT);
        this.GetEnvVar(process.env.MONGODB_URL, Env.MONGODB_URL);
        this.GetEnvVar(process.env.AUDIT_API_KEY, Env.AUDIT_API_KEY);
        this.GetEnvVar(process.env.LOG_LEVEL, Env.LOG_LEVEL);
        this.GetEnvVar(process.env.CONSOLELOG_ENABLED, Env.CONSOLELOG_ENABLED);
        this.GetEnvVar(process.env.FILELOG_ENABLED, Env.FILELOG_ENABLED);
        this.GetEnvVar(process.env.MONGOLOG_ENABLED, Env.MONGOLOG_ENABLED);

        if (this.missingEnvVars.length > 0) {
            const msg = '*** ERROR: Missing environment variables: ' + this.missingEnvVars.flat();
            console.log(msg);
            throw new Error(msg);
        }
    }

    private GetEnvVar(envVar: string | undefined, setting: Env): void {
        if (envVar !== undefined) {
            AppEnv.allSettings.push([setting, envVar]);
        } else {
            this.missingEnvVars.push(setting);
        }
    }

    public static Get(setting: Env): string {
        if (!AppEnv.instance) {
            AppEnv.instance = new AppEnv();
        }

        const t = AppEnv.allSettings.find((e) => e[0] === setting);

        if (t !== undefined) {
            return t[1];
        }

        throw new Error(`Could not find AppConfig: ${setting}`);
    }
}
