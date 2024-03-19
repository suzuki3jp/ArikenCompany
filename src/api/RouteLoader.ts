import { Router, type Request, type Response } from 'express';

import { UserRoleT } from '@/database';
import { services } from '@/api/routes';
import { AuthMiddleware } from '@/api/AuthMiddleware';
import { rootLogger } from '@/initializer';
import { ArikenCompany } from '@/ArikenCompany';

export class RouteLoader {
    public router: Router;

    private logger = rootLogger.createChild('RouteLoader');

    constructor(private ac: ArikenCompany) {
        this.router = this.loadRoutes();
    }

    private loadRoutes(): Router {
        this.logger.debug('Loading api routes...');
        const router = Router();

        services.forEach((s) => {
            const service = new s(this.ac);
            this.logger.debug(`Loading route ${service.path}`);
            const methods = ['get', 'post', 'put', 'delete'] as const;
            const usedMethod: (typeof methods)[number][] = [];

            methods.forEach((m) => {
                // @ts-expect-error 動作上問題ないが、型エラーが出る
                if (typeof service[m] === 'function') {
                    usedMethod.push(m);

                    router[m](service.path, AuthMiddleware(service.requiredRole[m], this.ac), (req, res) => {
                        // @ts-expect-error 動作上問題ないが、型エラーが出る
                        service[m](req, res);
                    });
                }
            });
            this.logger.system(`Loaded route ${usedMethod.map((v) => v.toUpperCase()).join(', ')} ${service.path}`);
        });
        return router;
    }
}

export interface RouteT {
    path: string;
    requiredRole: { get: UserRoleT | null; post: UserRoleT | null; put: UserRoleT | null; delete: UserRoleT | null };
    get?: (req: Request, res: Response) => void;
    post?: (req: Request, res: Response) => void;
    put?: (req: Request, res: Response) => void;
    delete?: (req: Request, res: Response) => void;
}
