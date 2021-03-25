import * as admin from 'firebase-admin';
const serviceAccount = require('../../service-account-file.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });


export const verify = (async (token) => {
  let content;

  await admin
  .auth()
  .verifyIdToken(token)
  .then((decodedToken) => { content = [decodedToken.uid, decodedToken.firebase.sign_in_provider]; })
  .catch((error) => { content = 'error'; });

  return content;
});


/*
admin
  .auth()
  .getUser('mJTCsG2whBXyiMKWqAGlG9anh5t2')
  .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log(`Successfully fetched user data: ${JSON.stringify(userRecord)}`);
    console.log(`Successfully fetched user data: ${userRecord.uid}`);
    
  })
  .catch((error) => {
    console.log('Error fetching user data:', error);
  });

  
*/
