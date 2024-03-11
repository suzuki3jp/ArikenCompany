import { Logger } from '@/packages';
import { EnvManager } from '@/managers';

export const rootLogger = new Logger('ArikenCompany');

export const env = new EnvManager();
