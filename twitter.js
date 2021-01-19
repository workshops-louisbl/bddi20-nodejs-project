const http = require("https")
const { Writable, Readable, pipeline, Transform } = require("stream")

const TWT_API_HOST = "api.twitter.com"
const TWT_API_PATH = "/2/tweets/sample/stream?tweet.fields=attachments,author_id,geo&expansions=author_id,attachments.media_keys&media.fields=url"
const BEARER_TOKEN = ""

const options = {
  host: TWT_API_HOST,
  path: TWT_API_PATH,
  method: "GET",
  headers: {
    Authorization: "Bearer " + BEARER_TOKEN
  }
}

const tweetStream = new Readable({
  read() { }
})

function connectToTwitter() {
  const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
      tweetStream.push(chunk)
    })
  })
  
  req.on('error', (error) => {
    console.error(error)
  })
  
  req.end()
}

module.exports = {
  tweetStream,
  connectToTwitter
}