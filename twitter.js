const http = require("https")
const { Writable, Readable, pipeline, Transform } = require("stream")

const TWT_API_HOST = "api.twitter.com"
const TWT_API_SAMPLE_PATH = "/2/tweets/sample/stream?tweet.fields=attachments,author_id,geo&expansions=author_id,attachments.media_keys&media.fields=url"
const TWT_API_SEARCH_PATH = "/2/tweets/search/stream?tweet.fields=attachments&expansions=attachments.media_keys&media.fields=url"
const TWT_API_RULES_PATH = "/2/tweets/search/stream/rules"
const BEARER_TOKEN = process.env.TWT_BEARER_TOKEN

const options = {
  host: TWT_API_HOST,
  headers: {
    "Content-type": "application/json",
    Authorization: "Bearer " + BEARER_TOKEN
  }
}

const tweetStream = new Readable({
  read() { }
})

function connectToTwitter() {
  const opts = {
    ...options,
    path: TWT_API_SEARCH_PATH,
    method: "GET",
  }

  const req = http.request(opts, (res) => {
    res.on('data', (chunk) => {
      tweetStream.push(chunk)
    })
  })
  
  req.on('error', (error) => {
    console.error(error)
  })
  
  req.end()
}

function setSearchRules(rules) {
  const opts = {
    ...options,
    path: TWT_API_RULES_PATH,
    method: "POST",
  }

  const data = JSON.stringify({
    add: rules
  })

  console.log("body data: ", data)

  const req = http.request(opts, (res) => {
    let data
    res.on("data", (chunk) => {
      data += chunk
    })
    res.on("end", () => {
      console.log("twt api response: ", data)
    })
  })

  req.write(data)
  req.end()
}

module.exports = {
  tweetStream,
  connectToTwitter,
  setSearchRules
}