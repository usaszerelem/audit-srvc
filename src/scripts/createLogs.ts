import { InitDatabase } from '../startup/database';
import { createAuditLogs } from '../utils/createAuditLogs';

createWrapper();

function createWrapper() {
    createLogs().then(() => console.log('Audit logs created'));
}

async function createLogs(): Promise<void> {
    try {
        const db = await InitDatabase();

        if (db) {
            await createAuditLogs();
        }
    } catch (ex) {
    } finally {
        console.log('Exiting process');
        process.exit();
    }
}
