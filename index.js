require("dotenv").config()
const { pipeline, Writable } = require("stream")
const WebSocket = require("ws")
const server = require("./server")
const {setSearchRules, connectToTwitter, tweetStream} = require("./twitter")
const {jsonParser, logger, textExtractor, tweetCounter} = require("./process-tweets")

// server http
server.listen(3000)
const wsServer = new WebSocket.Server({ server })

wsServer.on("connection", (client) => {
  console.log("new connection: ")

  client.on("message", (message) => {
    console.log("message from client: ", message)
    
    client.send("Hello from server")
  })

  // envoyer des données au client via websocket
  const socketStream = WebSocket.createWebSocketStream(client);
  pipeline(
    tweetStream,
    // jsonParser,
    // textExtractor,
    socketStream,
    (err) => {
      if (err) {
        console.error("pipeline error: ", err)
      } else {
        console.log("pipeline success")
      }
    }
  )
})


// connexion API Twitter
connectToTwitter()

// règles de filtrage pour tweets
setSearchRules([
  { value: "cat has:images", tag: "cat pictures"},
  { value: "koala has:images", tag: "koala pictures"}
])
