import { config } from 'dotenv';
import firebaseAdmin from 'firebase-admin';

const initFirebaseAdmin = () => {
  if (firebaseAdmin.apps.length > 0) {
    return firebaseAdmin.app();
  }

  config();

  const Adminconfig = firebaseAdmin.credential.cert(
    JSON.parse(
      JSON.stringify({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URI,
        client_x509_cert_url: process.env.FIREBASE_AUTH_CLIENT_X509_CERT_URI,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
      }),
    ),
  );

  //@ts-ignore
  const firebase = firebaseAdmin.initializeApp(Adminconfig);

  return firebase;
};

const admin = initFirebaseAdmin();

export default admin;
