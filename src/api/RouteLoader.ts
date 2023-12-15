import { readdirSync } from 'fs';
import { Router, Request, Response } from 'express';
import { resolve, join } from 'path';

import { RouteImpl } from './RouteImpl';
import { Api } from './Api';
import { Logger } from '../packages';

export class RouteLoader {
    public logger: Logger;
    constructor(public api: Api) {
        this.logger = this.api.logger.createChild('RouteLoader');
    }

    public load() {
        const router = Router();

        const routeFilePaths = this.getRouteFilePaths('./routes');
        routeFilePaths.forEach((routeFilePath) => {
            const routeData = this.getRouteData(routeFilePath);
            if (routeData.get) router.get(routeData.path, routeData.get);
            if (routeData.post) router.post(routeData.path, routeData.post);
            if (routeData.put) router.put(routeData.path, routeData.put);
            if (routeData.delete) router.delete(routeData.path, routeData.delete);
        });

        this.logger.system(`Routes loaded. ${routeFilePaths.join(', ')}`);
        return router;
    }

    private getRouteFilePaths(currentPath: string): string[] {
        const routesDirPath = this.generateAbsolutePath(__dirname, currentPath);
        const routeFiles = readdirSync(routesDirPath);

        const routeFilePaths: string[] = [];

        routeFiles.forEach((path) => {
            if (this.isFile(path)) {
                routeFilePaths.push(this.generateAbsolutePath(routesDirPath, path));
            } else {
                const subRouteFilePaths = this.getRouteFilePaths(join(currentPath, `/${path}`));
                routeFilePaths.push(...subRouteFilePaths);
            }
        });

        return routeFilePaths;
    }

    private getRouteData(routeFilePath: string): RouteData {
        const RouteController = require(routeFilePath).default as RouteImpl;
        let uri = routeFilePath.split('routes')[1].replaceAll('\\', '/').replaceAll('/index.ts', '');
        uri = uri === '' ? '/' : uri;
        // @ts-expect-error
        const route = new RouteController(uri);
        const routeData: RouteData = { path: route.path, get: null, post: null, put: null, delete: null };

        if (route.get) routeData.get = route.get;
        if (route.post) routeData.post = route.post;
        if (route.put) routeData.put = route.put;
        if (route.delete) routeData.delete = route.delete;
        return routeData;
    }

    private isFile(path: string): boolean {
        return path.indexOf('.') !== -1;
    }

    private generateAbsolutePath(currentPath: string, path: string): string {
        return resolve(currentPath, path);
    }
}

export interface RouteData {
    path: string;
    get: ((req: Request, res: Response) => void) | null;
    post: ((req: Request, res: Response) => void) | null;
    put: ((req: Request, res: Response) => void) | null;
    delete: ((req: Request, res: Response) => void) | null;
}
