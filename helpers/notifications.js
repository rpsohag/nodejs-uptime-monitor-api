const https = require("https");
const querystring = require("querystring");
const { twillio } = require("./environments");

// module scaffolding
const notificatons = {};

// send sms to user using twillio api
notificatons.sendtwillioSms = (phone, msg, callback) => {
  // input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      From: twillio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twillio.accountSid}/Messages.json`,
      auth: `${twillio.accountSid}:${twillio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // get the status code of the send request
      const status = res.statusCode;
      // callback
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        let responseData = "";

        // Collect response data for better error handling
        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          callback(
            `Status code returned was ${status}. Response: ${responseData}`
          );
        });
      }
    });

    req.on("error", (e) => {
      callback(e);
    });

    req.write(stringifyPayload);
    req.end();
    console.log(requestDetails);
  } else {
    callback("Given parameters were missing or invalid!");
  }
};

// export the module
module.exports = notificatons;
