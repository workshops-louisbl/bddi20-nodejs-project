require("dotenv").config()
const { pipeline, Writable } = require("stream")
const WebSocket = require("ws")
const server = require("./server")
const {addSearchRules, getSearchRules, deleteSearchRules} = require("./search-rules")
const {connectToTwitter, tweetStream} = require("./twitter")
const {jsonParser, logger, textExtractor, tweetCounter, getTweetFromSource} = require("./process-tweets")

// server http
server.listen(3000)
const wsServer = new WebSocket.Server({ server })

// create a passthrough: a transform that does nothing, just passing data through
const broadcaster = new PassThrough({
  writableObjectMode: true,
  readableObjectMode: true
})


wsServer.on("connection", (client) => {
  console.log("new connection: ")

  client.on("message", (message) => {
    console.log("message from client: ", message)
    
    client.send("Hello from server")
  })

  // create a new readable stream of tweets for this client
  const tweetSource = getTweetFromSource(broadcaster)
  
  // envoyer des données au client via websocket
  const socketStream = WebSocket.createWebSocketStream(client);
  pipeline(
    tweetSource,
    // add here what transform you want for this specific client
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
    socketStream.destroy() // destroy socketStream to terminate client pipeline
  })
})

// connexion API Twitter
connectToTwitter()

// main pipeline, ending with broadcaster passthrough stream
pipeline(
  tweetStream,
  jsonParser,
  // add here what transform you want for ALL clients
  // remember to set objectMode when needed
  broadcaster,
  (err) => {
    console.log("main pipeline ended")
    if (err) {
      console.error("main pipeline error: ", err)
    }
    console.log(tweetStream)
  }
)


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
