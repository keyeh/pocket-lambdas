// import firebase from "firebase-admin"
import * as firebase from "firebase-admin"
import serviceAccount from "./serviceAccount.json"

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://pocket-a7c79.firebaseio.com"
})
export default firebase.database()
