// https://nodejs.org/dist/latest-v14.x/docs/api/http.html

const { createServer } = require("http")
const fs = require("fs/promises")

const server = createServer()

server.on("request", async (request, response) => {
  console.log("on request", request.method, request.url)

  if (request.url === "/") {
    const file = await fs.readFile("./index.html", "utf8")
    response.writeHead(200)
    response.end(file)
  } else {
    response.writeHead(404)
    response.end()
  }
})

module.exports = server