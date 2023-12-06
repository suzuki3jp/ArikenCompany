import { writeFileSync as writeFileSyncFs } from 'fs';

export const writeFileSync = (path: string, data: string) => writeFileSyncFs(path, data, 'utf-8');
