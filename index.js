require("dotenv").config()
const { pipeline } = require("stream")
const WebSocket = require("ws")
const server = require("./server")
const {connectToTwitter, tweetStream} = require("./twitter")
const {jsonParser, logger} = require("./process-tweets")

// server http
server.listen(3000)
const wsServer = new WebSocket.Server({ server })

wsServer.on("connection", (client) => {
  console.log("new connection: ")

  client.on("message", (message) => {
    console.log("message from client: ", message)
    
    client.send("Hello from server")
  })

  tweetStream.on("data", (chunk) => {
    client.send(chunk)
  })
})


// connexion API Twitter
connectToTwitter()

// traiter les tweets (via transform)
// pipeline(
//   tweetStream,
//   jsonParser,
//   logger,
//   (err) => {
//     if (err) {
//       console.error("pipeline error: ", err)
//     } else {
//       console.log("pipeline success")
//     }
//   }
// )
  
  // envoyer des données au client via websocket
  // const wsServer = new WebSocket.Server({
    // server
    // })
    