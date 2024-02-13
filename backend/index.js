const express = require('express')
const cors = require('cors')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg')
const { readFile, unlink, rmdir, mkdir, readdir } = require('node:fs/promises');
const path = require('node:path');
const app = express()
const PORT = 3089

app.use(cors())
app.use(express.json())
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

console.log("mimicking youtube upload process. Deleting any existing screenshots.")

const cleanUp = async () => {
    try {
        const files = await readdir(__dirname + "/assets/frames")
        for (const file of files) {
            unlink(path.join(__dirname + "/assets/frames", file))
        }
        console.log("files from frames folder deleted")
    } catch (e) {
        console.error("error in deleting files: ", e);
    }
}
cleanUp()

console.log("taking screenshots now and saving them")
//get screenshots at 5 second intervals and store them in frames folder
ffmpeg.ffprobe("./assets/BigBuckBunny.mp4", (err, metadata) => {
    if (err) console.log("err", err)
    else {
        const videoDuration = Math.floor(metadata.format.duration)
        let timestamps = []

        for (let i = 0; i <= videoDuration; i += 5) {
            timestamps.push(i)
        }

        for (let timestamp of timestamps) {
            ffmpeg("./assets/BigBuckBunny.mp4")
                .screenshot({
                    timestamps: [timestamp],
                    filename: `thumbnail-at-${timestamp}.png`,
                    folder: './assets/frames',
                    size: '165x100'
                })
        }
        console.log("screenshots added to frames folder")
    }
})

app.get("/screenshot", async (req, res) => {
    const { timestamp } = req.query
    const screenshotBuffer = await readFile(__dirname + `/assets/frames/thumbnail-at-${timestamp}.png`)
    const screenshotB64 = Buffer.from(screenshotBuffer).toString('base64')

    res.status(200).send(JSON.stringify({ screenshotB64 }))
})

app.listen(PORT, () => {
    console.log("Server started")
})