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
        })
    }

    return res.json({
        success: true,
        message: "Success",
        data: distance,
    })
})

module.exports = router
