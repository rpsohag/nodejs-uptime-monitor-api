const data = require("./../../lib/data");
const utilites = require("./../../helpers/utilites");
const { parseJSON } = require("./../../helpers/utilites");
// module scaffolding

const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;
  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean" &&
    requestProperties.body.tosAgreement
      ? requestProperties.body.tosAgreement
      : false;
  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user does not already exist
    data.read("users", phone, (err, user) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: utilites.hash(password),
          tosAgreement,
        };
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(201, {
              message: "user was create successfully!",
            });
          } else {
            callback(500, {
              error: err,
            });
          }
        });
      } else {
        callback(500, {
          error: "there was a problem in server side",
        });
      }
    });
  } else {
    callback(400, {
      error: "you have a problem in your request",
      data: requestProperties.body,
    });
  }
};
handler._users.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // lookup the user
    data.read("users", phone, (err, u) => {
      const user = { ...parseJSON(u) };
      if (!err && user) {
        delete user.password;
        callback(200, user);
      } else {
        callback(404, {
          error: "Requested user was not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user was not found",
    });
  }
};
handler._users.put = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      data.read("users", phone, (err, u) => {
        const userData = { ...parseJSON(u) };
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.password = hash(password);
          }
          // update to database
          data.update("users", phone, userData, (err) => {
            if (!err) {
              callback(200, {
                message: "user was update successfully",
                data: userData,
              });
            } else {
              callback(500, {
                error: "There was a problem in server side",
              });
            }
          });
        } else {
          callback(400, {
            error: "You have a problem in your request",
          });
        }
      });
    } else {
      callback(400, {
        error: "You have a problem in your request",
      });
    }
  } else {
    callback(400, {
      error: "Invalid Phne number, please try again",
    });
  }
};
handler._users.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // lookup the user
    data.read("users", phone, (err, u) => {
      const user = { ...parseJSON(u) };
      if (!err && user) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callback(200, {
              message: "user was deleted successfully",
            });
          } else {
            callback(500, {
              error: "there was a server side error",
            });
          }
        });
      } else {
        callback(404, {
          error: "Requested user was not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user was not found",
    });
  }
};

module.exports = handler;
