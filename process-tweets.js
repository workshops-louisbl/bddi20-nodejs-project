const { Writable, Readable, pipeline, Transform } = require("stream")

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
  logger
}