import Expo from "exponent-server-sdk"
import db from "./db"

const setMatchingEnd = (userId, orderId) => {
    return db.ref(`users/${userId}/availableJobsAsWorker/${orderId}`).update({
        matchingEndsAt: Date.now() + 1 * 60 * 1000
    })
}

const notifyWorkerNewMatch = async (userId, orderId) => {
    const expo = new Expo()
    const matchedOrder = await db
        .ref(`users/${userId}/availableJobsAsWorker/${orderId}`)
        .once("value")
        .then(snapshot => snapshot.val())

    const pushToken = await db
        .ref(`users/${userId}/pushToken`)
        .once("value")
        .then(snapshot => snapshot.val())

    const { distance, jobType } = matchedOrder
    const notification = [
        {
            to: pushToken,
            sound: "default",
            body: `Wanna ${jobType} for someone ${distance} miles away?`,
            data: { orderId }
        }
    ]

    return expo.sendPushNotificationsAsync(notification)
}

export default {
    notifyWorkerNewMatch,
    setMatchingEnd
}
