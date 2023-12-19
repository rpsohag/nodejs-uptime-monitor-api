const http = require("http");
const { handeReqRes } = require("./helpers/handleReqRes");
const environmentToExport = require("./helpers/environments");
const data = require("./lib/data");

// app object  - module scaffolding

const app = {};

data.delete("test", "newFile", function (err) {
  console.log(err);
});

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
