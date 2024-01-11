import { AuthenticatorDevice } from "@simplewebauthn/typescript-types";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

export async function getUserByEmail(email: string) {
  let result;
  try {
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userSnapshot.size === 0)
      throw Error(`No users found for email: ${email}`);
    else if (userSnapshot.size > 1)
      throw Error(`More than one user found for email: ${email}`);

    const userData = userSnapshot.docs[0].data();

    result = { ...userData, id: userSnapshot.docs[0].id };
  } catch (e) {
    const error = e as Error;
    logger.error(error);
    result = { error: error.message };
  } finally {
    return result;
  }
}

export async function getUserAuthenticators(email: string) {
  let result;
  try {
    const userSnapshot = await db
      .collection("authenticators")
      .where("userEmail", "==", email)
      .get();

    if (userSnapshot.size === 0) {
      logger.log(`No authenticators found for email: ${email}`);
      return;
    } else if (userSnapshot.size >= 1) {
      const docsData: admin.firestore.DocumentData[] = [];
      userSnapshot.docs.forEach((userDoc) => {
        docsData.push(userDoc.data());
      });
      result = docsData;
    }
  } catch (e) {
    const error = e as Error;
    logger.error(error);
  } finally {
    return result;
  }
}

export async function getAuthenticatorById(email: string, id: string) {
  let result;
  try {
    const userSnapshot = await db
      .collection("authenticators")
      .where("userEmail", "==", email)
      .get();

    if (userSnapshot.size === 0)
      throw Error(`No authenticators found for email: ${email}`);
    else if (userSnapshot.size > 1)
      throw Error(`More than one authenticators found for email: ${email}`);

    const userData = userSnapshot.docs[0].data();
    result = userData;
  } catch (e) {
    const error = e as Error;
    logger.error(error);
  } finally {
    return result;
  }
}

export async function setUserCurrentChallenge(
  email: string,
  currentChallenge: string
) {
  let result;
  try {
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userSnapshot.size === 0)
      throw Error(`No users found for email: ${email}`);
    else if (userSnapshot.size > 1)
      throw Error(`More than one user found for email: ${email}`);

    result = await userSnapshot.docs[0].ref.update({ currentChallenge });
  } catch (e) {
    const error = e as Error;
    logger.error(error);
    result = { error: error.message };
  } finally {
    return result;
  }
}

export async function setUserAuthenticator(email: string, authenticator: any) {
  let result;
  try {
    result = await db.collection("authenticators").add(authenticator);
  } catch (e) {
    const error = e as Error;
    logger.error(error);
    result = { error: error.message };
  } finally {
    return result;
  }
}

export async function updateUserAuthenticator(
  authenticator: AuthenticatorDevice,
  counter: number
) {
  let result;
  try {
    const userSnapshot = await db
      .collection("authenticators")
      .where("credentialID", "==", authenticator.credentialID)
      .get();

    if (userSnapshot.size === 0) throw Error(`No users found for email: `);
    else if (userSnapshot.size > 1)
      throw Error(`More than one user found for email: `);

    result = await userSnapshot.docs[0].ref.update({ counter });
  } catch (e) {
    const error = e as Error;
    logger.error(error);
    result = { error: error.message };
  } finally {
    return result;
  }
}
