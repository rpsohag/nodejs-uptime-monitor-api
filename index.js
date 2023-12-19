const http = require("http");
const { handeReqRes } = require("./helpers/handleReqRes");
const environmentToExport = require("./helpers/environments");

// app object  - module scaffolding

const app = {};

// create server

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environmentToExport.port, () => {
    console.log(`Listening to port ${environmentToExport.port}`);
  });
};

// handle request and response
app.handleReqRes = handeReqRes;

// start the server
app.createServer();
