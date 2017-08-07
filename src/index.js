var functions = require("firebase-functions")
import matchmaker from "./matchmaker"
import notifications from "./notifications"
import db from "./db"

exports.matchWorker = functions.database.ref("/orders/{orderId}/requesterFbUid").onWrite(event => {
    if (event.data.val() == null) {
        return
    }
    // Grab the current value of what was written to the Realtime Database.
    console.log("Order:", event.params.orderId)
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    return matchmaker.getWorkerMatchesUpdateObject(event.params.orderId).then(updates => {
        return db.ref().update(updates)
    })
})

exports.notifyWorkerNewMatch = functions.database
    .ref("/users/{userId}/availableJobsAsWorker/{orderId}/distance")
    .onWrite(event => {
        if (event.data.val() == null) {
            return
        }
        // const { distance } = event.data.val()
        // console.log("distance:", distance)
        const { orderId, userId } = event.params
        console.log("Order:", orderId)
        console.log("userId:", userId)

        return notifications
            .notifyWorkerNewMatch(userId, orderId)
            .then(() => notifications.setMatchingEnd(userId, orderId))
    })
