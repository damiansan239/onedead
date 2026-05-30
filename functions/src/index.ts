/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import dockerNames from './utils/docker-names';


admin.initializeApp({
  projectId: "one-dead",
  storageBucket: "one-dead.appspot.com",
  databaseURL: "https://one-dead-default-rtdb.firebaseio.com",
});

setGlobalOptions({
  maxInstances: 1,
  serviceAccount: "firebase-adminsdk-ly025@one-dead.iam.gserviceaccount.com",
});


export const generateUserToken = onRequest(
  { cors: true },
  (request, response) => {
    const uid = dockerNames.getRandomName();

    getAuth()
      .createCustomToken(uid)
      .then((customToken) => {
        response
          .send(customToken)
          .end();
      })
      .catch((error) => {
        console.log('Error creating custom token:', error);
      });
    // logger.info("Hello logs!", { structuredData: true });
  });
