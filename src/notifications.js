import Expo from "exponent-server-sdk"
import db from "./db"

const notifyWorkerNewMatch = async (matchedWorkerId, orderId) => {
    const expo = new Expo()
    // const pushTokens = (await Promise.all(
    //     Object.keys(matchedWorkers).map(
    //         k =>
    //             new Promise(resolve => {
    //                 db.ref(`users/${k}/pushToken`).once("value", resolve)
    //             })
    //     )
    // )).map(snapshot => snapshot.val())

    const order = await db.ref(`orders/${orderId}`).once("value").then(snapshot => snapshot.val())

    const pushToken = await db
        .ref(`users/${matchedWorkerId}/pushToken`)
        .once("value")
        .then(snapshot => snapshot.val())

    const distance = order.matchedWorkers[matchedWorkerId].distance
    const notification = {
        to: pushToken,
        sound: "default",
        body: `Wanna ${order.jobType} for someone ${distance} miles away?`,
        data: { order }
    }
    console.log("sending:", notification)

    return expo.sendPushNotificationsAsync(notification)
}

export default {
    notifyWorkerNewMatch
}
