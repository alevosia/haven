const firebaseAdmin = require('firebase-admin');

const firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: process.env.PRIVATE_KEY
    }),
    databaseURL: process.env.DATABASE_URL
})

module.exports = firebaseApp.firestore();