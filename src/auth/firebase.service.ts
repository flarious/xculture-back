import { firebaseConfig } from "src/configs/firebaseConfig";
import * as firebase from 'firebase-admin';
import { Injectable } from "@nestjs/common";

@Injectable()
export class FirebaseService {
    private firebaseApp: firebase.app.App;

    constructor() {
        this.firebaseApp = firebase.initializeApp({
            credential: firebase.credential.cert({...firebaseConfig}),
        })
    }

    getAuth = (): firebase.auth.Auth => {
        return this.firebaseApp.auth();
    }
}