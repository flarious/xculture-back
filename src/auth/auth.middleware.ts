import { Injectable, NestMiddleware } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { Request, Response} from 'express'; 
import * as firebase from 'firebase-admin';

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
    private auth: firebase.auth.Auth;

    constructor(private firebaseApp: FirebaseService) {
        this.auth = firebaseApp.getAuth();
    }

    use(req: Request, res: Response, next: () => void) {
        const token = req.headers.authorization;
        if (token != null && token != '') {
            this.auth
            .verifyIdToken(token.replace('bearer ', ''))
            .then(async (decodedToken) => {
                const user = {
                    id: decodedToken.uid,
                    email: decodedToken.email
                }
                req['user'] = user;
                next();
                return user;
            })
            .catch(() => {
                PreAuthMiddleware.accessDenied(req.url, res);
            });
        }
        else {
            PreAuthMiddleware.accessDenied(req.url, res);
        }
    }

    private static accessDenied(url: string, res: Response) {
        res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: url,
            message: 'access denied',
        });
    }
}