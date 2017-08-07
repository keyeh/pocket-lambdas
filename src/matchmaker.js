import GeoFire from "geofire"
import _ from "lodash"
import serviceAccount from "./serviceAccount.json"
import db from "./db"

const geoFire = new GeoFire(db.ref("userLocations"))

const fetchOrder = async orderId => {
    return db.ref(`orders/${orderId}`).once("value").then(snapshot => {
        return snapshot.val()
    })
}

const findWorkersInRange = async requesterFbUid => {
    const location = await geoFire.get(requesterFbUid)
    // console.log("location", location)
    const gQuery = geoFire.query({
        center: location,
        radius: 50
    })
    return new Promise(resolve => {
        const results = {}

        gQuery.on("key_entered", function(key, location, distance) {
            results[key] = distance
            // console.log(key + " entered query at " + location + " (" + distance + " km from center)")
        })

        gQuery.on("ready", function() {
            // console.log("GeoQuery has loaded and fired all other events for initial data")
            gQuery.cancel()
            resolve(results)
        })
    })
}

// unfiltered = {someuid: 123distance}
// const filterMaxDistance = async unfilteredWorkerGeoResults => {
//     const promises = Object.keys(unfilteredWorkerGeoResults).map(async k => {
//         const maxWorkDistance = await Base.fetch(`user/${k}/maxWorkDistance`, { context: this })
//         if (unfilteredWorkerGeoResults[k] < maxWorkDistance) {
//             return
//         }
//     })
//     return Promise.all(promises)
// }

const findWorkersWithJobType = jobType => {
    return db
        .ref(`users`)
        .orderByChild(`jobTypes/${jobType}`)
        .equalTo(true)
        .once("value")
        .then(snapshot => {
            return snapshot.val()
        })
}

const getWorkerMatchesUpdateObject = async orderId => {
    const { requesterFbUid, jobType } = await fetchOrder(orderId)
    const workersInRange = await findWorkersInRange(requesterFbUid)
    const workersWithJobType = await findWorkersWithJobType(jobType)

    const commonKeys = _.intersection(_.keys(workersInRange), _.keys(workersWithJobType))

    return Object.assign(
        {},
        ...commonKeys.map(workerId => {
            if (workerId === requesterFbUid) {
                return
            }
            return {
                [`users/${workerId}/availableJobsAsWorker/${orderId}`]: {
                    distance: workersInRange[workerId],
                    jobType
                },
                [`orders/${orderId}/availableWorkers/${workerId}`]: true
            }
        })
    )
}

export default {
    getWorkerMatchesUpdateObject
}
