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

module.exports = utilites;
