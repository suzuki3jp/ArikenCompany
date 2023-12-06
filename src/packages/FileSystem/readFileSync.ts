import { readFileSync as readFileSyncFs } from 'fs';

export const readFileSync = (path: string) => readFileSyncFs(path, 'utf-8');
