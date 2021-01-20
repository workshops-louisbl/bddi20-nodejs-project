require("dotenv").config()
const { pipeline } = require("stream")
const server = require("./server")
const {connectToTwitter, tweetStream} = require("./twitter")
const {jsonParser, logger} = require("./process-tweets")

// server http
server.listen(3000)

// connexion API Twitter
connectToTwitter()

// traiter les tweets (via transform)
pipeline(
  tweetStream,
  jsonParser,
  logger,
  (err) => {
    if (err) {
      console.error("pieline error: ", err)
    }
  }
)

// envoyer des données au client via websocket
// const wsServer = new WebSocket.Server({
// server
// })
