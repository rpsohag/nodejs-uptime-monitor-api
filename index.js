const http = require("http");
const { handeReqRes } = require("./helpers/handleReqRes");

// app object  - module scaffolding

const app = {};

// configuration
app.config = {
  port: 3000,
};

// create server

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(app.config.port, () => {
    console.log(`Listening to port ${app.config.port}`);
  });
};

// handle request and response
app.handleReqRes = handeReqRes;

// start the server
app.createServer();
