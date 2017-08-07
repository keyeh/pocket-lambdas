var functions = require("firebase-functions")
import matchmaker from "./matchmaker"
import notifications from "./notifications"

exports.matchWorker = functions.database.ref("/orders/{orderId}/requesterFbUid").onWrite(event => {
    if (event.data.val() == null) {
        return
    }
    // Grab the current value of what was written to the Realtime Database.
    console.log("Order:", event.params.orderId)
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    return matchmaker.getMatchedWorkersWithDistance(event.params.orderId).then(matchedWorkers => {
        event.data.ref.parent.child("matchedWorkers").set(matchedWorkers)
    })
})

exports.notifyWorkerNewMatch = functions.database
    .ref("/orders/{orderId}/matchedWorkers/{workerId}")
    .onWrite(event => {
        if (event.data.val() == null) {
            return
        }
        // const { distance } = event.data.val()
        // console.log("distance:", distance)
        const { orderId, workerId } = event.params
        console.log("Order:", orderId)
        console.log("workerId:", workerId)
        return notifications.notifyWorkerNewMatch(workerId, orderId)
    })
