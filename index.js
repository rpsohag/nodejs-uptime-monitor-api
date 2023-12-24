const http = require("http");
const { handeReqRes } = require("./helpers/handleReqRes");
const environmentToExport = require("./helpers/environments");
const { sendtwillioSms } = require("./helpers/notifications");

// app object  - module scaffolding

const app = {};

// create server

//
sendtwillioSms("01931602886", "hello world", (err) => {
  console.log(err);
});

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
