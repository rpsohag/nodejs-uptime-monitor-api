const crypto = require("crypto");
const environments = require("./environments");

// dependencies

// module scaffolding

const utilites = {};

// parse JSON string to object

utilites.parseJSON = (string) => {
  let output;
  try {
    output = JSON.parse(string);
  } catch (error) {
    output = {};
  }
  return output;
};

// hash string
utilites.hash = (string) => {
  if (typeof string === "string" && string.length > 0) {
    let hash = crypto
      .createHmac("sha256", environments.secretKey)
      .update(string)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// create random string
utilites.createRandomString = (strLen) => {
  let length = strLen;
  length = typeof strLen === "number" && strLen > 0 ? strLen : false;
  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let output = "";
    for (let i = 1; i <= length; i += 1) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};

module.exports = utilites;
