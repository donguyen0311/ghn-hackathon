const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const helmet = require("helmet")
const compression = require("compression")

const routes = require("./routes")
// 106.66291,10.77033;106.656311,10.76345
const port = 3000

function shouldCompress(req, res) {
    if (req.headers["x-no-compression"]) {
        // don't compress responses with this request header
        return false
    }

    // fallback to standard filter function
    return compression.filter(req, res)
}

app.use(helmet())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(bodyParser.json({ limit: "50mb" }))
app.use(cookieParser())
app.use(logger("dev"))

app.use(compression({ filter: shouldCompress }))

app.use("/api", routes)

app.listen(port, () => {
    console.log(`Listening at port ${port}`)
})
