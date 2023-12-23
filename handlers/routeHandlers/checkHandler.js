const data = require("./../../lib/data");
const utilites = require("./../../helpers/utilites");
const { parseJSON } = require("./../../helpers/utilites");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("./../../helpers/environments");
// module scaffolding

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
  // input validates
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.protocol.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  let timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === "number" &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;
  if (protocol && url && method && successCodes && timeOutSeconds) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;
    // lookup the user phone by reading the token
    data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
        data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length <= maxChecks) {
                  let checkId = utilites.createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone: userPhone,
                    protocol: protocol,
                    url: url,
                    method: method,
                    successCodes: successCodes,
                    timeOutSeconds: timeOutSeconds,
                  };
                  // save the object
                  data.create("checks", checkId, checkObject, (err) => {
                    if (!err) {
                      // add check id the the user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);
                      // save the new user Data
                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "there was a error in server side",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "there was a error in server side",
                      });
                    }
                  });
                } else {
                  callback(403, {
                    error: "User has already reached max check limits",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication Problem",
                });
              }
            });
          } else {
            callback(403, {
              error: "User Not Found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Unauthenticated",
        });
      }
    });
  } else {
    callback(400, {
      error: "you have a problem in your input",
    });
  }
};
handler._check.get = (requestProperties, callback) => {
  // check the phone number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // verify token
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, parseJSON(checkData));
            } else {
              callback(403, {
                error: "Authentication Faild",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: err,
        });
      }
    });
  } else {
    callback(400, {
      error: "you have a problem in your Request",
    });
  }
};
handler._check.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.protocol.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  let timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === "number" &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;
  if (id) {
    if (protocol || url || method || successCodes || timeOutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);
          // verify token
          let token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;
          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeOutSeconds) {
                  checkObject.timeOutSeconds = timeOutSeconds;
                }
                // store the checkObject
                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callback(200, checkObject);
                  } else {
                    callback(500, {
                      error: "There was a server side error",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication Faild",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "There was a problem in server side",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least on field to update",
      });
    }
  } else {
    callback(400, {
      error: "you have a problem in your Request",
    });
  }
};
handler._check.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // lookup the check
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // verify token
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              // delete the check data
              data.delete("checks", id, (err) => {
                if (!err) {
                  data.read(
                    "users",
                    parseJSON(checkData).userPhone,
                    (err, userData) => {
                      let userObject = parseJSON(userData);
                      if (!err && userData) {
                        let userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];
                        // remove the delte checkid from users list of checks
                        let checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // update the user data
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phone,
                            userObject,
                            (err) => {
                              if (!err) {
                                callback(200, userObject);
                              } else {
                                callback(500, {
                                  error: "There was a server side error",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            error: "There was a server side error",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "There was a server side error",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, {
                    error: "There was a server side error",
                  });
                }
              });
            } else {
              callback(403, {
                error: "Authentication Faild",
              });
            }
          }
        );
      } else {
        callback(500, {
          error: err,
        });
      }
    });
  } else {
    callback(400, {
      error: "you have a problem in your Request",
    });
  }
};

module.exports = handler;
