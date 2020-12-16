const express = require("express")
const axios = require("axios")

const router = express.Router()

async function getDistance(fromPoint, toPoint) {
    let response = await axios(
        `https://router.project-osrm.org/route/v1/driving/${fromPoint.lng},${fromPoint.lat};${toPoint.lng},${toPoint.lat}?overview=false&alternatives=true&steps=true&hints=;`
    )

    let data = response.data

    let distance = data.routes[0].distance
    let duration = data.routes[0].duration

    console.log(distance, duration)

    return distance
}

const middlewareAuth = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers["x-access-token"]
    if (token === "50727962-3b52-11eb-adc1-0242ac120002") {
        next()
    } else {
        return res.send({
            success: false,
            message: "No token provied.",
        })
    }
}

router.get("/", (req, res) => {
    res.json({
        message: "Welcome to API",
    })
})

router.post("/get-distance", middlewareAuth, async (req, res) => {
    let body = req.body

    let fromPoint = body.from
    let toPoint = body.to

    let distance = 0

    try {
        distance = await getDistance(fromPoint, toPoint)
    } catch (error) {
        return res.json({
            success: false,
            message: "Something wrong.",
            data: 0,
        })
    }

    return res.json({
        success: true,
        message: "Success",
        data: distance,
    })
})

router.post("/get-priority", middlewareAuth, async (req, res) => {
    let body = req.body

    let distance = body.distance
    let weight = body.weight
    let deadline_pickup = body.deadline_pickup

    let priority = 0

    /** 
        weight: 1-5kg: trọng số 1, >5 : trọng số 2
        distance: <=2km: trọng số 1, 2 - 5km: trọng số 2, >5km: trọng số 3
        deadline_pickup: 
        - ca sáng: trước 9h: trọng số 3, trước 10h: trọng số 2, trong ca làm việc sáng - trước 11h: trọng số 1
        - ca chiều: trước 14h: trọng số 3, trước 16h: trọng số 2, trong ca làm việc chiều - trước 19h: trọng số 1
        priority: trọng số deadline_pickup*3 + trọng số distance*2 + trọng số weight*1
    */
    try {
        priority = deadline_pickup * 3 + distance * 2 + weight * 1
    } catch (error) {
        return res.json({
            success: false,
            message: "Something wrong.",
            data: priority,
        })
    }

    return res.json({
        success: true,
        message: "Success",
        data: priority,
    })
})

module.exports = router
