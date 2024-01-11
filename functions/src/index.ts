/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import {
  authenticationOptions,
  registrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from "./passkeys";
import { getUserByEmail } from "./users";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const getUser = onRequest(async (request, response) => {
  logger.info("Hello logs!", { structuredData: true });

  const user = await getUserByEmail("test@example.com");

  response.json(user);
});

// GET generateRegistrationOptions
export const generateRegistrationOptions = onRequest(
  async (request, response) => {
    logger.log(request.query);
    const email = request.query["userEmail"]?.toString();
    logger.log(email);

    if (!email) {
      response.json({ error: "No email passed" });
      return;
    }
    const options = await registrationOptions(email);

    response.json(options);
  }
);

// POST verifyRegistrationResponse
export const verifyRegistrationResponse = onRequest(
  async (request, response) => {
    const result = await verifyRegistration(request);

    response.json(result);
  }
);

// GET authenticationOptions
export const generateAuthenticationOptions = onRequest(
  async (request, response) => {
    logger.log(request.query);
    const email = request.query["userEmail"]?.toString();
    logger.log(email);

    if (!email) {
      response.json({ error: "No email passed" });
      return;
    }
    const result = await authenticationOptions(email);

    response.json(result);
  }
);

// POST verifyAuthentication
export const verifyAuthenticationResponse = onRequest(
  async (request, response) => {
    const result = await verifyAuthentication(request);

    response.json(result);
  }
);

export const loginPasskey = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
