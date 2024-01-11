import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

import { AuthenticatorDevice } from "@simplewebauthn/server/script/deps";
import { logger } from "firebase-functions/v1";
import { Request } from "firebase-functions/v2/https";
import {
  getAuthenticatorById,
  getUserAuthenticators,
  getUserByEmail,
  setUserAuthenticator,
  setUserCurrentChallenge,
  updateUserAuthenticator,
} from "../users";

// Human-readable title for your website
const rpName = "Passkeys";
// A unique identifier for your website
const rpID = "localhost";
// The URL at which registrations and authentications should occur
const origin = `http://${rpID}:5173`;

export async function registrationOptions(userEmail: string) {
  // (Pseudocode) Retrieve the user from the database
  // after they've logged in
  const user = await getUserByEmail(userEmail);

  if (!user) return;

  // (Pseudocode) Retrieve any of the user's previously-
  // registered authenticators
  const userAuthenticators = await getUserAuthenticators(user.email);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.email,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: "none",
    // Prevent users from re-registering existing authenticators
    excludeCredentials: userAuthenticators?.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      // Optional
      transports: authenticator.transports,
    })),
    // See "Guiding use of authenticators via authenticatorSelection" below
    authenticatorSelection: {
      // Defaults
      residentKey: "preferred",
      userVerification: "preferred",
      // Optional
      authenticatorAttachment: "platform",
    },
  });

  // (Pseudocode) Remember the challenge for this user
  setUserCurrentChallenge(user.email, options.challenge);

  return options;
}

export async function verifyRegistration(req: Request) {
  const { body } = req;

  // (Pseudocode) Retrieve the logged-in user
  const user = await getUserByEmail(body.userEmail);

  logger.log(body);

  if (!user) return;
  // (Pseudocode) Get `options.challenge` that was saved above
  const expectedChallenge: string = user.currentChallenge;
  console.log;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (e) {
    const error = e as Error;
    logger.error(error);
    return { error: error.message };
  }

  const { verified } = verification;

  if (verification.verified) {
    const { registrationInfo } = verification;
    if (!registrationInfo) return;
    const {
      credentialPublicKey,
      credentialID,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    const newAuthenticator = {
      userEmail: user.email,
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp,
      // `body` here is from Step 2
      transports: body.response.transports,
    };

    // (Pseudocode) Save the authenticator info so that we can
    // get it by user ID later
    await setUserAuthenticator(user.email, newAuthenticator);
  }
  return { verified };
}

export async function authenticationOptions(userEmail: string) {
  // (Pseudocode) Retrieve the logged-in user
  const user = await getUserByEmail(userEmail);
  // (Pseudocode) Retrieve any of the user's previously-
  // registered authenticators
  const userAuthenticators = await getUserAuthenticators(userEmail);

  const options = await generateAuthenticationOptions({
    rpID,
    // Require users to use a previously-registered authenticator
    allowCredentials: userAuthenticators?.map((authenticator) => ({
      id: authenticator.credentialID,
      type: "public-key",
      transports: authenticator.transports,
    })),
    userVerification: "preferred",
  });

  // (Pseudocode) Remember this challenge for this user
  setUserCurrentChallenge(userEmail, options.challenge);

  return options;
}

export async function verifyAuthentication(req: Request) {
  const { body } = req;

  // (Pseudocode) Retrieve the logged-in user
  const user = await getUserByEmail(body.userEmail);

  if (!user) return;

  // (Pseudocode) Get `options.challenge` that was saved above
  const expectedChallenge = user.currentChallenge;
  // (Pseudocode} Retrieve an authenticator from the DB that
  // should match the `id` in the returned credential
  const authenticator = await getAuthenticatorById(user.email, body.id);

  if (!authenticator) {
    throw new Error(
      `Could not find authenticator ${body.id} for user ${user.id}`
    );
  }

  let verification;
  const authenticatorDevice = authenticator as AuthenticatorDevice;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: authenticatorDevice,
    });
  } catch (e) {
    const error = e as Error;
    logger.error(error);
    return { error: error.message };
  }

  const { verified } = verification;

  if (verified) {
    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;

    updateUserAuthenticator(authenticatorDevice, newCounter);
  }

  return { verified };
}
