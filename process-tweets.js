const { Writable, Readable, pipeline, Transform } = require("stream")

function getTweetFromSource(broadcaster) {
  // create a new source stream for each client
  const tweetSource = new Readable({
    objectMode: true,
    read() { }
  })

  // data event callback
  function pushToSource(chunk) {
    tweetSource.push(chunk)
  }

  // listen to new data from main pipeline and push it to client stream
  broadcaster.on("data", pushToSource)

  // remove event listener if error, emitted from client pipeline
  tweetSource.on("error", () => {
    broadcaster.off("data", pushToSource)
  })

  return tweetSource
}

const jsonParser = new Transform({
  readableObjectMode: true,

  transform(chunk, _, callback) {
    let data = {}
    try {
      data = JSON.parse(chunk)
    } catch (error) {

    }
    this.push(data)
    callback()
  }
})

const textExtractor = new Transform({
  writableObjectMode: true,

  transform(chunk, _, callback) {
    const text = chunk?.data?.text + ""

    this.push(text)

    callback()
  }
})

const tweetCounter = new Transform({
  transform(chunk, _, callback) {
    this.counter++

    this.push(this.counter.toString())

    callback()
  }
})
tweetCounter.counter = 0

const logger = new Writable({
  objectMode: true,
  write(chunk, encoding, callback) {
    try {
      console.log(JSON.stringify(chunk))
    } catch (err) {
      // 
    }
    callback()
  }
})

module.exports = {
  jsonParser,
  textExtractor,
  tweetCounter,
  logger,
  getTweetFromSource
}