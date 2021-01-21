require("dotenv").config()
const { pipeline, Writable } = require("stream")
const WebSocket = require("ws")
const server = require("./server")
const {addSearchRules, getSearchRules, deleteSearchRules} = require("./search-rules")
const {connectToTwitter, tweetStream} = require("./twitter")
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

  socketStream.on("close", () => {
    socketStream.destroy()
  })
})

// connexion API Twitter
connectToTwitter()

// vider puis ajouter les filtres
async function resetRules() {
  // récupérer les filtres existants
  const existingRules = await getSearchRules()
  const ids = existingRules?.data?.map(rule => rule.id)
  
  //supprimer tous les filtres
  if (ids) {
    await  deleteSearchRules(ids)
  }

  // règles de filtrage pour tweets
  addSearchRules([
    { value: "cat has:images", tag: "cat pictures" },
    { value: "koala has:images", tag: "koala pictures" }
  ])
}

resetRules()
