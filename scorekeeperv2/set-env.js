const fs = require('fs');
require('dotenv').config();

const targetPath = './src/environments/environment.ts';
const envConfigFile = `export const environment = {
  production: ${process.env.NODE_ENV === 'production'},
  firebase: {
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}',
    databaseURL: '${process.env.FIREBASE_DATABASE_URL || ''}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ''}',
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}'
  }
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment file generated at ${targetPath}`);
