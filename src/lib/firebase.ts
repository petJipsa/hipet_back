import * as admin from 'firebase-admin';
const serviceAccount = require('../../service-account-file.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

export const verify = (async (token) => {
  let content;

  await admin
  .auth()
  .verifyIdToken(token)
  .then((decodedToken) => { content = [decodedToken.uid, decodedToken.firebase.sign_in_provider]; })
  .catch((error) => { 
    console.log(error);
    
    content = 'error'; });

  return content;
});