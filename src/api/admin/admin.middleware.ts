import { NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminMiddleware implements NestMiddleware {

    async use(req: Request, res: Response, next: () => void) {
        const isAdmin = await AdminService.checkAdmin(req["user"].id);
        if (isAdmin) {
            next();
        }
        else {
            AdminMiddleware.accessDenied(req.url, res);
        }
    }

    private static accessDenied(url: string, res: Response) {
        res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: url,
            message: 'Admin only',
        });
    }
}