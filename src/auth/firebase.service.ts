import * as firebase from 'firebase-admin';
import { Injectable } from "@nestjs/common";

@Injectable()
export class FirebaseService {
    private firebaseApp: firebase.app.App;

    constructor() {
        this.firebaseApp = firebase.initializeApp({
            credential: firebase.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        })
    }

    getAuth = (): firebase.auth.Auth => {
        return this.firebaseApp.auth();
    }
}